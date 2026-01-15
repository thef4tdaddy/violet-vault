## 🔁 Milestone Closeout Checklist

**Milestone:** ${{ github.event.milestone.title }}  
**Due (if set):** ${{ github.event.milestone.due_on }}

Please review and update the following in **develop** branch:

### 📚 Core Documentation Updates

- [ ] `/README.md` - Update status, project structure, and current milestone progress
      → https://github.com/thef4tdaddy/violet-vault/blob/develop/README.md
- [ ] `/ROADMAP.md` - Update milestone status and upcoming plans
      → https://github.com/thef4tdaddy/violet-vault/blob/develop/ROADMAP.md
- [ ] `/docs/MILESTONES.md` - Document milestone completion and achievements
      → https://github.com/thef4tdaddy/violet-vault/blob/develop/docs/MILESTONES.md
- [ ] `/docs/Source-Code-Directory.md` - Update with new components and file counts
      → https://github.com/thef4tdaddy/violet-vault/blob/develop/docs/Source-Code-Directory.md

### 🔧 Technical Documentation Updates

- [ ] `/docs/LINT_WARNINGS.md` - Update current warning counts and refactoring progress
      → https://github.com/thef4tdaddy/violet-vault/blob/develop/docs/LINT_WARNINGS.md
- [ ] `/docs/ESLint-Rules.md` - Verify all rules are documented with current status
      → https://github.com/thef4tdaddy/violet-vault/blob/develop/docs/ESLint-Rules.md

### 🔗 Dependencies & Tooling

- [ ] Run a dependency health check (`npm outdated` and `npx npm-check-updates`).
- [ ] Assess which updates are **worth** doing this cycle (security, bugfix, perf, TypeScript types, build tooling). Note breaking changes.
- [ ] If updating, create separate branch for update, test, then merge into develop before release; otherwise record rationale in `/docs/milestones.md` under this milestone.
- [ ] After updates, run CI locally: `npm run build && npm test && npm run typecheck`.
- [ ] Verify multi-language tooling: `./scripts/full_salvo.sh` (TypeScript, Go, Python)

### 📦 Release Planning

- [ ] Review versioning strategy: stable releases from `main`, pre-releases from `develop` (every 10 commits)
- [ ] Verify Release Please configuration is up-to-date in `.github/workflows/release-please.yml`
- [ ] Check that conventional commits are being used for proper version bumping
- [ ] Confirm deployment strategy: patch auto-deploy, minor/major require approval

### 📝 Documentation audit

- [ ] Audit all top-level markdown files (`/README*.md`, `/*.md`, `/docs/**/*.md`).
- [ ] Move content worth keeping into `/docs/` in the appropriate section (create subfolders if needed) - LEAVE README/ROADMAP/CLAUDE/CHANGELOG/CONTRIBUTING/LICENSE IN ROOT
- [ ] Delete or archive irrelevant/duplicated markdown (prefer removal if clearly obsolete).
- [ ] Ensure internal links use stable paths within `/docs/`.

### 🧹 Lint warnings & policy update

- [ ] Run `npm run lint` and capture warning totals.
- [ ] Fix low-risk warnings that do not change public behavior (style, import order, obvious dead code).
- [ ] If warnings remain, document why and create/attach issues.
- [ ] Update `/docs/LINT_WARNINGS.md` with:
  - Current totals and delta from previous release
  - Notable new rule violations
  - Action plan (owner, target milestone)

### What to do

- Ensure **${{ github.event.milestone.title }}** is documented accurately.
- Add/adjust links to issues included in this milestone.
- Note any scope changes since creation.
- Perform dependency assessment and update if beneficial.
- Complete documentation audit and move/remove markdown as needed.
- Clear appropriate lint warnings and update `/docs/LINT_WARNINGS.md`.
- Commit changes directly to `develop`.

---

_This issue was auto-created to remind you to keep documentation in sync with the milestone._
