import argparse
import concurrent.futures
import json
import os
import shutil
import subprocess
import sys
import threading
import time
from dataclasses import dataclass

# Configuration
ERROR_DIR = ".salvo_errors"
FAILED_CHECKS_FILE = os.path.join(ERROR_DIR, "failed_checks.json")
STATS_FILE = os.path.join(ERROR_DIR, "stats.json")


# ANSI Colors & Control Codes
class Colors:
    RED = "\033[0;31m"
    GREEN = "\033[0;32m"
    YELLOW = "\033[1;33m"
    BLUE = "\033[0;34m"
    MAGENTA = "\033[0;35m"
    CYAN = "\033[0;36m"
    GRAY = "\033[90m"
    NC = "\033[0m"
    BOLD = "\033[1m"
    # Cursor controls
    HIDE_CURSOR = "\033[?25l"
    SHOW_CURSOR = "\033[?25h"
    UP = "\033[A"
    CLR = "\033[K"
    CLEAR_LINE = "\033[2K"


@dataclass
class Check:
    name: str
    command: str
    cwd: str = "."
    is_fixer: bool = False
    concurrency_group: str | None = None
    language: str = "general"

    # State managed by runner
    status: str = "PENDING"
    duration: float = 0.0
    start_time: float = 0.0
    error_msg: str = ""

    @property
    def id(self) -> str:
        return self.name.lower().replace(" ", "_")

    def __hash__(self) -> int:
        return hash(self.name)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Check):
            return NotImplemented
        return self.name == other.name


class SalvoRunner:
    def __init__(self, fix_mode: bool, retry_mode: bool) -> None:
        self.fix_mode = fix_mode
        self.retry_mode = retry_mode
        self.checks: list[Check] = []
        self.start_time = time.time()
        self.is_tty = sys.stdout.isatty()
        self.locks: dict[str, threading.Semaphore] = {
            "heavy": threading.Semaphore(3)  # Allow 3 whales at once (Smart Overlap)
        }

        # Ensure error directory exists
        if os.path.exists(ERROR_DIR) and not retry_mode:
            shutil.rmtree(ERROR_DIR)
        os.makedirs(ERROR_DIR, exist_ok=True)

        # Load stats
        self.stats = self._load_stats()

        # Load previous failures if retrying
        self.previous_failures: set = set()
        if retry_mode:
            self._load_previous_failures()

        if retry_mode:
            self._load_previous_failures()

    def _load_stats(self) -> dict:
        if os.path.exists(STATS_FILE):
            try:
                with open(STATS_FILE) as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        return data
            except Exception:
                pass
        return {}

    def _save_stats(self, check: Check, duration: float, success: bool) -> None:
        if not success:
            return

        # We don't need a lock for the dict update itself if we just overwrite keys
        # but file write should be safe.
        # Actually in threaded env, dict update is atomic for single key.
        # But let's be safe with file write.
        # Moving average (weight new value 30%)
        prev = self.stats.get(check.name, duration)
        new_stats = self.stats.copy()
        new_stats[check.name] = prev * 0.7 + duration * 0.3
        self.stats = new_stats  # Atomic swap

        try:
            with open(STATS_FILE, "w") as f:
                json.dump(new_stats, f)
        except Exception:
            pass

    def _load_previous_failures(self) -> None:
        if os.path.exists(FAILED_CHECKS_FILE):
            try:
                with open(FAILED_CHECKS_FILE) as f:
                    data = json.load(f)
                    self.previous_failures = set(data.get("failures", []))
            except Exception:
                pass

    def save_failure_state(self) -> None:
        """Saves current failures + unfinished tests so they can be retried."""
        failures = [c for c in self.checks if c.status in ("FAIL", "RUNNING", "PENDING", "WAITING")]
        if failures:
            with open(FAILED_CHECKS_FILE, "w") as f:
                json.dump({"timestamp": time.time(), "failures": [c.name for c in failures]}, f)
        elif os.path.exists(FAILED_CHECKS_FILE):
            os.remove(FAILED_CHECKS_FILE)

    def add_check(self, check: Check) -> None:
        if self.retry_mode and check.name not in self.previous_failures:
            check.status = "SKIPPED"

        if check.concurrency_group and check.concurrency_group not in self.locks:
            self.locks[check.concurrency_group] = threading.Semaphore(1)  # Default to sequential

        self.checks.append(check)

    def resolve_tool(self, tool_name: str) -> str | None:
        """Resolves a tool path (PATH -> .venv -> python -m)."""
        if shutil.which(tool_name):
            return tool_name

        venv_path = os.path.join(".venv", "bin", tool_name)
        if os.path.exists(venv_path):
            return venv_path

        try:
            subprocess.run(
                [sys.executable, "-m", tool_name, "--version"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return f"{sys.executable} -m {tool_name}"
        except Exception:
            pass
        return None

    def run_command(self, check: Check) -> bool:
        """Runs a single check and returns True if successful."""
        if check.concurrency_group:
            check.status = "WAITING"
            with self.locks[check.concurrency_group]:
                return self._execute_check_logic(check)
        else:
            return self._execute_check_logic(check)

    def _execute_check_logic(self, check: Check) -> bool:
        output_file = os.path.join(ERROR_DIR, f"{check.id}.txt")
        check.status = "RUNNING"
        check.start_time = time.time()
        start_t = time.time()

        # Ensure subprocesses use color/terminal features even when piped
        env = os.environ.copy()
        env["FORCE_COLOR"] = "1"
        env["TERM"] = "xterm-256color"

        try:
            with open(output_file, "w") as outfile:
                result = subprocess.run(
                    check.command,
                    shell=True,
                    cwd=check.cwd,
                    stdout=outfile,
                    stderr=subprocess.STDOUT,
                    text=True,
                    env=env,
                )

            check.duration = time.time() - start_t
            success = result.returncode == 0
            check.status = "PASS" if success else "FAIL"

            # Save stats
            self._save_stats(check, check.duration, success)

            return success
        except Exception as e:
            check.duration = time.time() - start_t
            check.status = "FAIL"
            with open(output_file, "a") as f:
                f.write(f"\nExecution Error: {str(e)}")
            return False

    def print_dashboard(self) -> None:
        """Prints the live status table."""
        if not self.is_tty:
            return

        try:
            term_width = os.get_terminal_size().columns
        except OSError:
            term_width = 80

        # Move up to start of dashboard
        total_lines = len(self.checks) + 6  # Header (3) + Executing (1) + Timer (1) + Status (1)
        sys.stdout.write(f"\033[{total_lines}A")

        # Header
        print(
            f"{Colors.CLR}{Colors.MAGENTA}================================================================================{Colors.NC}"
        )
        print(
            f"{Colors.CLR}{Colors.MAGENTA}🚀 VioletVault Full Salvo - Optimized Parallel Verification{Colors.NC}"
        )
        print(
            f"{Colors.CLR}{Colors.MAGENTA}================================================================================{Colors.NC}"
        )
        print(
            f"{Colors.CLR}{Colors.BLUE}⚡️ Executing {len([c for c in self.checks if c.status != 'SKIPPED'])} checks...{Colors.NC}"
        )

        elapsed_total = time.time() - self.start_time

        # Calculate Progress
        total_weight = 0.0
        done_weight = 0.0

        active = [chk for chk in self.checks if chk.status != "SKIPPED"]
        for chk in active:
            w = self.stats.get(chk.name, 15.0)  # Default 15s for better progress estimation
            total_weight += w
            if chk.status in ("PASS", "FAIL"):
                done_weight += w
            elif chk.status == "RUNNING" and chk.start_time > 0:
                # Add partial progress (capped at 100% of weight)
                done_weight += min(time.time() - chk.start_time, w)

        pct = (done_weight / total_weight) if total_weight > 0 else 0.0
        pct = min(1.0, max(0.0, pct))

        # Progress Bar
        bar_len = 20
        filled = int(bar_len * pct)
        bar = "█" * filled + "░" * (bar_len - filled)

        # Use CLEAR_LINE on every print to avoid artifacts

        timer_line = f"{Colors.MAGENTA}⏱️  {elapsed_total:5.1f}s {Colors.BLUE}[{Colors.GREEN}{bar}{Colors.GRAY}{Colors.BLUE}]{Colors.NC} {int(pct*100)}%"
        print(f"{Colors.CLR}{timer_line}")

        status_line = (
            f"{Colors.BLUE}⚡️ Processing... (Threads: {threading.active_count()}){Colors.NC}"
        )
        print(f"{Colors.CLR}{status_line}")

        for check in self.checks:
            symbol = "●"
            color = Colors.GRAY

            avg_time = self.stats.get(check.name, 0)
            avg_str = f"{Colors.GRAY}(~{int(avg_time)}s){Colors.NC}" if avg_time > 0 else ""

            # Default PENDING with avg
            status_text = f"PENDING {avg_str}"

            if check.status == "RUNNING":
                color = Colors.BLUE
                symbol = "⟳"
                elapsed = time.time() - check.start_time
                time_str = f"{elapsed:.1f}s"

                # Overtime Warning (Red if > 1.5x average)
                if avg_time > 0 and elapsed > avg_time * 1.5:
                    time_str = f"{Colors.RED}{time_str}{Colors.NC}"
                    running_avg_str = f"{Colors.RED}(Avg: {int(avg_time)}s){Colors.NC}"
                else:
                    running_avg_str = avg_str

                status_text = f"RUNNING {time_str} {running_avg_str}"

            elif check.status == "PASS":
                color = Colors.GREEN
                symbol = "✓"
                status_text = f"PASSED ({check.duration:.1f}s)"
            elif check.status == "FAIL":
                color = Colors.RED
                symbol = "✗"
                status_text = f"FAILED ({check.duration:.1f}s)"
            elif check.status == "SKIPPED":
                color = Colors.GRAY
                symbol = "-"
                status_text = "SKIPPED"
            elif check.status == "WAITING":
                color = Colors.YELLOW
                symbol = "⏳"
                status_text = f"WAITING {avg_str}"

            if check.concurrency_group:
                status_text += f"{Colors.GRAY} [{check.concurrency_group}]{Colors.NC}"

            name_pad = f"{check.name:<20}"
            line_content = f"{symbol} {name_pad} {status_text}"

            # Use strict visual length truncation from before
            visible_content = line_content
            for color_code in [
                Colors.RED,
                Colors.GREEN,
                Colors.YELLOW,
                Colors.BLUE,
                Colors.MAGENTA,
                Colors.CYAN,
                Colors.GRAY,
                Colors.NC,
                Colors.BOLD,
                Colors.CLEAR_LINE,
            ]:
                visible_content = visible_content.replace(color_code, "")

            max_len = term_width - 8  # Safety buffer for different terminals
            if len(visible_content) > max_len:
                excess = len(visible_content) - max_len
                status_text = status_text[: -excess - 3] + "..."
                line = f"  {color}{symbol} {name_pad} {status_text}{Colors.NC}"
            else:
                line = f"  {color}{line_content}{Colors.NC}"

            print(f"{Colors.CLR}{line}")

        sys.stdout.flush()

    def _run_bucket(self, checks: list[Check], workers: int) -> None:
        if not checks:
            return

        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {executor.submit(self.run_command, c): c for c in checks}

            while any(f.running() for f in futures):
                if self.is_tty:
                    self.print_dashboard()
                time.sleep(0.5)  # Throttled refresh to reduce overhead

            for f in futures:
                f.result()

            if self.is_tty:
                self.print_dashboard()

    def execute(self) -> None:
        if self.is_tty:
            # Reserve space for the dashboard
            sys.stdout.write(Colors.HIDE_CURSOR)
            print()  # Title/Header line 1
            print()  # Header line 2
            print()  # Header line 3
            print()  # Processing line
            print()  # Timer line
            print()  # Status line
            for _ in self.checks:
                print()
            sys.stdout.flush()

        try:
            active_checks = [c for c in self.checks if c.status != "SKIPPED"]

            if self.fix_mode:
                fixers = [c for c in active_checks if c.is_fixer]
                others = [c for c in active_checks if not c.is_fixer]

                # Phase 1: Fixers
                if fixers:
                    self._run_bucket(fixers, workers=1)

                # Phase 2: Others
                if others:
                    self._run_bucket(others, workers=12)
            else:
                self._run_bucket(active_checks, workers=12)

        finally:
            self.save_failure_state()

        # ---------------------------------------------------------
        # Reporting Phase
        # ---------------------------------------------------------
        failures = [c for c in self.checks if c.status == "FAIL"]

        print("\n")
        if not failures:
            print(f"{Colors.GREEN}═══════════════════════════════════════{Colors.NC}")
            print(f"{Colors.GREEN}  ✓ All Checks Passed{Colors.NC}")
            print(f"{Colors.GREEN}═══════════════════════════════════════{Colors.NC}\n")
            print(f"{Colors.GREEN}Ready for deployment! 🚀{Colors.NC}\n")

            if os.path.exists(FAILED_CHECKS_FILE):
                os.remove(FAILED_CHECKS_FILE)

            os.makedirs(".git", exist_ok=True)
            with open(".git/FULL_SALVO_SUCCESS", "w") as f:
                f.write(str(time.time()))

            sys.exit(0)
        else:
            print(f"{Colors.RED}═══════════════════════════════════════{Colors.NC}")
            print(f"{Colors.RED}  ✗ {len(failures)} Check(s) Failed{Colors.NC}")
            print(f"{Colors.RED}═══════════════════════════════════════{Colors.NC}\n")

            # Failure state already saved in finally block

            # Detailed Reports
            for check in failures:
                log_file = os.path.join(ERROR_DIR, f"{check.id}.txt")
                print(f"{Colors.RED}▼ {check.name}{Colors.NC}")

                if os.path.exists(log_file):
                    with open(log_file) as f:
                        content = f.read()

                    lines = content.splitlines()

                    # Smart Summary
                    errors = []
                    if "TypeScript" in check.name:
                        errors = [line for line in lines if "error TS" in line]
                    elif "ESLint" in check.name:
                        errors = [
                            line for line in lines if "error" in line and "warning" not in line
                        ]
                    elif "Vitest" in check.name:
                        errors = [line for line in lines if "FAIL" in line or "Error:" in line]

                    if errors:
                        print(f"{Colors.YELLOW}  Summary of errors:{Colors.NC}")
                        for err in errors[:5]:
                            display_err = (err[:100] + "...") if len(err) > 100 else err
                            print(f"  {Colors.RED}•{Colors.NC} {display_err.strip()}")
                        if len(errors) > 5:
                            print(f"  ... and {len(errors)-5} more.")
                        print("")

                    # Log Dump
                    if len(lines) > 50:
                        print(f"{Colors.CYAN}--- Raw Log (First 20 lines) ---{Colors.NC}")
                        print("\n".join(lines[:20]))
                        print(
                            f"{Colors.YELLOW}... [TRUNCATED {len(lines)-40} lines] ...{Colors.NC}"
                        )
                        print(f"{Colors.CYAN}--- Raw Log (Last 20 lines) ---{Colors.NC}")
                        print("\n".join(lines[-20:]))
                    else:
                        print("\n".join(lines))
                print("")

            print(f"{Colors.YELLOW}💡 Tip: Run with --fix to auto-fix issues{Colors.NC}")
            print(f"{Colors.YELLOW}   ./scripts/full_salvo.sh --fix{Colors.NC}")
            sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="VioletVault Full Salvo")
    parser.add_argument("--fix", action="store_true", help="Auto-fix issues")
    parser.add_argument("--retry-failed", action="store_true", help="Retry only failed checks")
    parser.add_argument("--upload", action="store_true", help="Upload coverage to Codecov")
    parser.add_argument("--all", action="store_true", help="Force full run (ignore smart retry)")
    args = parser.parse_args()

    # Smart Logic Implementation
    now = time.time()

    # Smart Retry: If no explicit args, check for recent failures
    if not args.retry_failed and not args.fix and not args.upload and not args.all:
        if os.path.exists(FAILED_CHECKS_FILE):
            try:
                with open(FAILED_CHECKS_FILE) as f:
                    data = json.load(f)
                    if now - data.get("timestamp", 0) < 300:  # 5 minutes
                        args.retry_failed = True
                        print(
                            f"{Colors.YELLOW}🔄 Smart Retry: Detected recent failure ({int(now - data.get('timestamp', 0))}s ago). Retrying failed checks...{Colors.NC}"
                        )
                        print(f"{Colors.GRAY}   (Pass --all to force full run){Colors.NC}")
            except Exception:
                pass

    # Smart Fix: Default to auto-fixing formatting unless disabled (or maybe just keep explicit --fix?)
    # User said "make the fix smart. prettying smart."
    # Let's interpret this as: Always auto-fix Prettier/Lint/Ruff if it's safe.
    # To be safe, we'll just ENABLE fix mode by default if not retrying specific things?
    # actually, let's keep it explicit but auto-suggest?
    # User said "make the fix smart". I will enable it by default for this "Smart" run.
    if not args.fix:
        args.fix = True  # Enabled by default for smart run

    runner = SalvoRunner(args.fix, args.retry_failed)

    # 1. Frontend
    if args.fix:
        # Prettier first to clean up formatting
        runner.add_check(Check("Prettier", "npm run format", is_fixer=True))
        runner.add_check(Check("ESLint", "npm run lint:fix", is_fixer=True))
    else:
        # Check only
        runner.add_check(Check("Prettier", "npm run format"))
        runner.add_check(Check("ESLint", "npm run lint"))

    runner.add_check(Check("TypeScript", "npm run typecheck", concurrency_group="heavy"))
    # Use test:ci to ensure it doesn't hang in watch mode
    runner.add_check(Check("Vitest", "npm run test:ci", concurrency_group="heavy"))
    # Prod build as requested for speed/verification
    runner.add_check(Check("Build-Prod", "npm run build", concurrency_group="heavy"))

    # 2. Go Backend
    if os.path.exists("api/go.mod"):
        if args.fix:
            runner.add_check(Check("Go Fmt", "go fmt ./...", cwd="api", is_fixer=True))
        runner.add_check(Check("Go Vet", "go vet ./...", cwd="api"))
        runner.add_check(Check("Go Build", "go build ./...", cwd="api"))
        runner.add_check(
            Check("Go Test", "go test ./... -cover -coverprofile=coverage.out", cwd="api")
        )

    # 3. Python Backend
    # Detect python
    has_python = False
    for _, _, files in os.walk("api"):
        if any(f.endswith(".py") for f in files):
            has_python = True
            break

    if has_python:
        # Resolve tools dynamically
        ruff = runner.resolve_tool("ruff")
        mypy = runner.resolve_tool("mypy")
        pytest = runner.resolve_tool("pytest")

        if ruff:
            if args.fix:
                runner.add_check(Check("Ruff Format", f"{ruff} format api/", is_fixer=True))
                runner.add_check(Check("Ruff Lint", f"{ruff} check --fix api/", is_fixer=True))
            else:
                runner.add_check(Check("Ruff Format", f"{ruff} format --check api/"))
                runner.add_check(Check("Ruff Lint", f"{ruff} check api/"))
        else:
            print(f"{Colors.YELLOW}⚠️  Ruff not found (skipped){Colors.NC}")

        if mypy:
            # Add concurrency_group="heavy" to prevent heavy overlap
            runner.add_check(
                Check("Mypy", f"{mypy} api/ --ignore-missing-imports", concurrency_group="heavy")
            )
        else:
            print(f"{Colors.YELLOW}⚠️  Mypy not found (skipped){Colors.NC}")

        # Pytest
        if pytest:
            cmd = f"{pytest} api/ --cov=api --cov-report=xml:api_coverage.xml"
            runner.add_check(Check("Pytest", cmd))
        else:
            print(f"{Colors.YELLOW}⚠️  Pytest not found (skipped){Colors.NC}")

    # 4. Smart Upload
    # Upload if --upload OR (Token exists AND > 30 mins since last upload)
    should_upload = args.upload
    token = os.environ.get("CODECOV_TOKEN")

    if not should_upload and token:
        # Check last upload time
        stats = runner.stats
        last_upload = stats.get("last_upload_ts", 0)
        if now - last_upload > 1800:  # 30 mins
            should_upload = True
            print(
                f"{Colors.CYAN}☁️  Smart Upload: Last upload was >30m ago. Uploading coverage...{Colors.NC}"
            )

    if should_upload:
        if not token:
            if args.upload:  # Only warn if explicitly requested
                print(
                    f"{Colors.YELLOW}⚠️  --upload specified but CODECOV_TOKEN env var not found. Skipping upload.{Colors.NC}"
                )
        else:
            # Mark upload start time (or success time, but start is safer to prevent spam loops on fail)
            runner.stats["last_upload_ts"] = now
            runner.add_check(
                Check("Codecov Upload", "npx --yes codecov", concurrency_group="network")
            )

    runner.execute()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        # Restore cursor on Ctrl+C
        sys.stdout.write(Colors.SHOW_CURSOR)
        print("\n\nCancelled.")
        sys.exit(130)
