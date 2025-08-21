## 🔁 Milestone Closeout Checklist

**Milestone:** ${{ github.event.milestone.title }}  
**Due (if set):** ${{ github.event.milestone.due_on }}

Please review and update the following in **develop** branch:

- [ ] `/docs/source-code-directory.md`  
       → https://github.com/thef4tdaddy/violet-vault/blob/develop/docs/source-code-directory.md
- [ ] `/docs/milestones.md`  
       → https://github.com/thef4tdaddy/violet-vault/blob/develop/docs/milestones.md
- [ ] `/docs/roadmap.md`  
       → https://github.com/thef4tdaddy/violet-vault/blob/develop/docs/roadmap.md

### 🔗 Dependencies & tooling

- [ ] Run a dependency health check (`npm outdated` and `npx npm-check-updates`).
- [ ] Assess which updates are **worth** doing this cycle (security, bugfix, perf, TypeScript types, build tooling). Note breaking changes.
- [ ] If updating, create/label issues and link them here; otherwise record rationale in `/docs/milestones.md` under this milestone.
- [ ] After updates, run CI locally: `npm run build && npm test && npm run typecheck`.

### 📝 Documentation audit

- [ ] Audit all top-level markdown files (`/README*.md`, `/*.md`, `/docs/**/*.md`).
- [ ] Move content worth keeping into `/docs/` in the appropriate section (create subfolders if needed).
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
