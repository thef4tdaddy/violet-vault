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
STATS_FILE = ".salvo_stats.json"


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

        self.stats = self._load_stats()

        # Load previous failures if retrying
        self.previous_failures: set = set()
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
                # If we cannot read or parse the failures metadata, ignore it and proceed
                # as though there are no recent failures; this only affects auto-retry behavior.
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
            avg = self.stats.get(chk.name, 15.0)
            if chk.status in ("PASS", "FAIL"):
                # Use actual duration for weight if it was longer than average
                w = max(avg, chk.duration)
                total_weight += w
                done_weight += w
            elif chk.status == "RUNNING" and chk.start_time > 0:
                elapsed = time.time() - chk.start_time
                # Inflate total weight if we are running overtime
                w = max(avg, elapsed)
                total_weight += w
                # Progress is actual elapsed capped at 95% of its current calculated weight
                done_weight += min(elapsed, w * 0.95)
            else:
                total_weight += avg

        pct = (done_weight / total_weight) if total_weight > 0 else 0.0
        pct = min(1.0, max(0.0, pct))

        # Progress Bar
        bar_len = 20
        filled = int(bar_len * pct)
        bar = "█" * filled + "░" * (bar_len - filled)

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
                    time_str = f"{Colors.RED}{time_str}{Colors.BLUE}"
                    running_avg_str = f"{Colors.RED}(Avg: {int(avg_time)}s){Colors.BLUE}"
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
                status_text += f"{Colors.GRAY} [{check.concurrency_group}]"

            # Truncation Logic that respects visual length vs ANSI codes
            # We construct the visual string separate from the colored string

            # 1. Clean visual content (for length calculations)
            clean_status = (
                status_text.replace(Colors.RED, "")
                .replace(Colors.BLUE, "")
                .replace(Colors.GREEN, "")
                .replace(Colors.GRAY, "")
                .replace(Colors.NC, "")
            )
            name_pad = f"{check.name:<20}"

            # 2. Check fit
            # symbol (2) + name (20) + padding (1) + status (len)
            visual_len = 2 + 20 + 1 + len(clean_status)
            max_len = term_width - 2  # Safety buffer

            if visual_len > max_len:
                # Truncate content, not ANSI
                avail = max_len - (2 + 20 + 1) - 3  # -3 for "..."
                if avail > 0:
                    # Crude truncation: just cut the clean status.
                    # Ideally we preserve colors but this is hard without a parser.
                    # Fallback: Strip colors if we must truncate to avoid corrupting terminal
                    # This implies: If line too long -> Monochrome truncation
                    clean_status = clean_status[:avail] + "..."
                    status_text = clean_status  # Lose colors on truncation to be safe
                else:
                    status_text = "..."

            # 3. Final Print
            # Reset color at end to be safe
            line = f"  {color}{symbol} {name_pad} {status_text}{Colors.NC}"
            print(f"{Colors.CLR}{line}")

        sys.stdout.flush()

    def _run_bucket(self, checks: list[Check], workers: int) -> None:
        if not checks:
            return

        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {executor.submit(self.run_command, c): c for c in checks}

            while any(not f.done() for f in futures):
                if self.is_tty:
                    self.print_dashboard()
                time.sleep(0.5)  # Throttled refresh to reduce overhead

            for f in futures:
                f.result()

            if self.is_tty:
                self.print_dashboard()

    def execute(self) -> bool:
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

            return True
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
                        # Capture standard tsc error lines: "src/file.ts:1:1 - error TS..."
                        errors = [line.strip() for line in lines if "error TS" in line]

                    elif "ESLint" in check.name:
                        # Capture ESLint error lines
                        errors = [
                            line.strip()
                            for line in lines
                            if "error" in line and "warning" not in line and "/" in line
                        ]

                    elif "Vitest" in check.name:
                        # Capture Vitest file indicators and errors
                        # We want lines with "❯" (location) and "×" or "FAIL" or "Error:"
                        errors = [
                            line.strip()
                            for line in lines
                            if "❯" in line
                            or "Error:" in line
                            or "FAIL" in line
                            or "×" in line
                            or "❌" in line
                        ]

                    elif "Vite Build" in check.name:
                        # Capture Vite/Rollup errors
                        errors = [
                            line.strip()
                            for line in lines
                            if "error" in line.lower() or "failed" in line.lower()
                        ]

                    # Fallback for generic checks
                    elif not errors:
                        errors = [
                            line.strip()
                            for line in lines
                            if "error" in line.lower() or "fail" in line.lower()
                        ]

                    if errors:
                        print(f"{Colors.YELLOW}  Summary of errors:{Colors.NC}")
                        # Deduplicate while preserving order
                        seen = set()
                        unique_errors = []
                        for e in errors:
                            if e not in seen:
                                unique_errors.append(e)
                                seen.add(e)

                        for err in unique_errors[:15]:
                            # Colorize keywords
                            display_err = err
                            if "❯" in display_err:
                                display_err = f"{Colors.CYAN}{display_err}{Colors.NC}"
                            elif "Error" in display_err or "FAIL" in display_err:
                                display_err = f"{Colors.RED}{display_err}{Colors.NC}"

                            display_err = (
                                (display_err[:120] + "...")
                                if len(display_err) > 120
                                else display_err
                            )
                            print(f"  • {display_err}")

                        if len(unique_errors) > 15:
                            print(
                                f"  {Colors.GRAY}... and {len(unique_errors)-15} more lines.{Colors.NC}"
                            )
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

            return False


def main() -> None:
    parser = argparse.ArgumentParser(description="VioletVault Full Salvo")
    parser.add_argument("--retry-failed", action="store_true", help="Retry only failed checks")
    parser.add_argument("--upload", action="store_true", help="Upload coverage to Codecov")
    parser.add_argument("--all", action="store_true", help="Force full run (ignore smart retry)")
    parser.add_argument(
        "--e2e", action="store_true", help="Include E2E smoke tests (30-min debounce)"
    )
    args = parser.parse_args()

    # Implicit Retry Logic
    # If previous failures exist and no explicit "all" requested, default to retry
    # BUT only if failures are recent ( < 5 minutes )
    if os.path.exists(FAILED_CHECKS_FILE) and not args.all and not args.retry_failed:
        try:
            with open(FAILED_CHECKS_FILE) as f:
                data = json.load(f)
                ts = data.get("timestamp", 0)
                # If failures are fresh (< 300s / 5m), retry them.
                # Otherwise, fall through to normal "Smart Scope" or "All" logic.
                if time.time() - ts < 300:
                    print(
                        f"{Colors.YELLOW}⚠️  Recent failures detected (< 5m ago). Defaulting to RETRY FAILED mode.{Colors.NC}"
                    )
                    print(f"{Colors.GRAY}   (Run with --all to force full check){Colors.NC}\n")
                    args.retry_failed = True
                else:
                    print(
                        f"{Colors.GRAY}ℹ️  Previous failures expired (> 5m ago). Starting fresh run.{Colors.NC}"
                    )
        except Exception:
            pass

    # Auto-fix is now the default and only behavior
    args.fix = True
    now = time.time()

    # Smart Scope Analysis
    scope = {"frontend": True, "backend_go": True, "backend_python": True}
    if not args.all and not args.retry_failed:
        try:
            # Check for changes against main branch
            result = subprocess.run(
                ["git", "diff", "--name-only", "origin/main...HEAD"], capture_output=True, text=True
            )
            if result.returncode == 0:
                changes = result.stdout.splitlines()
                # If changes exist, narrow scope. If no output (or error), run all.
                if changes:
                    scope["frontend"] = any(
                        f.startswith("src/")
                        or f.startswith("package")
                        or f.endswith(".ts")
                        or f.endswith(".tsx")
                        for f in changes
                    )
                    scope["backend_go"] = any(
                        f.startswith("api/") and not f.endswith(".py") for f in changes
                    )
                    scope["backend_python"] = any(f.endswith(".py") for f in changes)

                    # If common configs change, run all
                    if any(f.startswith("scripts/") or f.startswith("configs/") for f in changes):
                        scope = {k: True for k in scope}

                    print(f"{Colors.BLUE}🔍 Smart Scope Detected:{Colors.NC}")
                    print(f"   Frontend: {'✅' if scope['frontend'] else 'Skipped'}")
                    print(f"   Go:       {'✅' if scope['backend_go'] else 'Skipped'}")
                    print(f"   Python:   {'✅' if scope['backend_python'] else 'Skipped'}")
        except Exception:
            # Fallback to running everything if git check fails
            pass

    # Fallback: if no specific scope detected (e.g. config change), run all
    if not any(scope.values()):
        scope = {k: True for k in scope}

    runner = SalvoRunner(args.fix, args.retry_failed)

    # Enforce strict serialization for heavy tasks as requested
    import threading

    runner.locks["heavy"] = threading.Semaphore(1)

    # 3. Register Checks
    if scope["frontend"]:
        runner.add_check(
            Check(
                "Prettier",
                "npm run format",
                is_fixer=True,
                concurrency_group="cpu",
            )
        )
        runner.add_check(
            Check(
                "ESLint",
                "npm run lint:fix",
                is_fixer=True,
                concurrency_group="cpu",
            )
        )
        runner.add_check(Check("TypeScript Check", "npm run typecheck", concurrency_group="heavy"))
        runner.add_check(Check("Vite Build", "npm run build", concurrency_group="heavy"))
        runner.add_check(Check("Vitest Units", "npm run test:run", concurrency_group="heavy"))

    if scope["backend_go"]:
        runner.add_check(
            Check("Go Format", "gofmt -l -w api", is_fixer=True, concurrency_group="go")
        )
        runner.add_check(Check("Go Vet", "cd api && go vet ./...", concurrency_group="go"))
        runner.add_check(Check("Go Build", "cd api && go build ./...", concurrency_group="go"))
        runner.add_check(Check("Go Tests", "cd api && go test ./...", concurrency_group="go"))

    if scope["backend_python"]:
        # Explicitly use .venv binaries
        python_bin = os.path.join(os.getcwd(), ".venv", "bin", "python")
        if not os.path.exists(python_bin):
            python_bin = "python3"

        runner.add_check(
            Check(
                "Ruff Format",
                f"cd api && {python_bin} -m ruff format .",
                is_fixer=True,
                concurrency_group="python",
            )
        )
        runner.add_check(
            Check(
                "Ruff Lint",
                f"cd api && {python_bin} -m ruff check . --fix",
                is_fixer=True,
                concurrency_group="python",
            )
        )
        runner.add_check(
            Check("MyPy", f"cd api && {python_bin} -m mypy .", concurrency_group="heavy")
        )
        runner.add_check(
            Check("Pytest", f"cd api && {python_bin} -m pytest", concurrency_group="python")
        )

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

    # 5. E2E Testing (Debounced)
    # E2E tests if --e2e OR (> 30 mins since last E2E run)
    should_run_e2e = args.e2e

    if not should_run_e2e:
        # Check last E2E run time
        last_e2e_ts = runner.stats.get("last_e2e_ts", 0)
        if now - last_e2e_ts > 1800:  # 30 mins
            should_run_e2e = True
            print(
                f"{Colors.CYAN}🎭 E2E Smoke Tests: Last run was >30m ago. Running tests...{Colors.NC}"
            )
        else:
            # Calculate remaining debounce time
            remaining = int(1800 - (now - last_e2e_ts))
            remaining_min = remaining // 60
            print(
                f"{Colors.GRAY}⏳ E2E Tests debounced (run again in ~{remaining_min}m or use --e2e to force){Colors.NC}"
            )

    if should_run_e2e:
        # Mark E2E test start time
        runner.stats["last_e2e_ts"] = now
        runner.add_check(
            Check("E2E Smoke Tests", "npm run test:e2e:smoke", concurrency_group="e2e")
        )

    # 6. Execute checks
    success = runner.execute()

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        # Restore cursor on Ctrl+C
        sys.stdout.write(Colors.SHOW_CURSOR)
        print("\n\nCancelled.")
        sys.exit(130)
