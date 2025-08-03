# VSCode Tasks Guide for VioletVault

## How to Access Tasks

### Method 1: Command Palette

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Tasks: Run Task"
3. Select from the list of available tasks

### Method 2: Terminal Menu

1. Go to `Terminal` menu in the top bar
2. Click `Run Task...`
3. Select from the list of available tasks

### Method 3: Keyboard Shortcut

- Press `Ctrl+Shift+P` then type "task" to quickly filter to task commands

## Available Tasks

### 🚀 Deployment Tasks

#### 🚀 Deploy to Production

- **When to use**: Ready to deploy main branch to production
- **Requirements**: Must be on `main` branch, no uncommitted changes
- **What it does**: Full safety checks, builds, creates tags, prepares for upload
- **Use case**: Your wife wants the latest stable version

#### 🧪 Deploy to Staging

- **When to use**: Testing features before production
- **Requirements**: Preferably on `develop` branch
- **What it does**: Creates staging build, lighter safety checks
- **Use case**: Test new features safely

#### 🚨 Quick Deploy + Format (Main → Production)

- **When to use**: Emergency deployment with auto-formatting
- **Requirements**: Must be on `main` branch
- **What it does**: Auto-format, commit, then deploy
- **Use case**: Quick production fix

### 🌿 Development Workflow Tasks

#### 🌿 Create New Branch

- **When to use**: Starting new feature or bugfix
- **Requirements**: Must be on `main` branch, clean working directory
- **What it does**: Creates branch, handles uncommitted changes, pushes to remote
- **Use case**: Beginning new feature development

#### 🧬 Rebase Current Branch

- **When to use**: Update feature branch with latest main changes
- **Requirements**: Any branch except main
- **What it does**: Formats code, rebases onto main, squashes commits
- **Use case**: Preparing feature branch for merge

#### 🧹 Clean Merged Branches

- **When to use**: Clean up after merging branches
- **Requirements**: None
- **What it does**: Deletes merged local branches, prunes remote references
- **Use case**: Housekeeping after completed features

### 🔄 Safety & Backup Tasks

#### 💾 Backup Data

- **When to use**: Before major changes or deployments
- **Requirements**: None
- **What it does**: Creates backup instructions and manages backup history
- **Use case**: Safety net before risky changes

#### 🔄 Rollback Options

- **When to use**: When you need to see what rollback options are available
- **Requirements**: None
- **What it does**: Lists commits, tags, backups available for rollback
- **Use case**: Investigating rollback possibilities

#### 🔴 Emergency Rollback (Previous Commit)

- **When to use**: EMERGENCY ONLY - production is broken
- **Requirements**: Must be on `main` branch
- **What it does**: Immediately rolls back to previous commit
- **Use case**: Critical production issue needs immediate fix

### 🔨 Build Tasks

#### 🔨 Build Production

- **When to use**: Create production-optimized build
- **Requirements**: None
- **What it does**: Creates optimized build in `dist/` folder
- **Use case**: Testing production build locally

#### 🧪 Build Staging

- **When to use**: Create staging build for testing
- **Requirements**: None
- **What it does**: Creates staging build with debug info
- **Use case**: Testing features in staging-like environment

### 🛠️ Development Server Tasks

#### 🛠️ Dev Server

- **When to use**: Daily development work
- **Requirements**: None
- **What it does**: Starts hot-reload development server
- **Use case**: Active development and testing

#### 🧪 Staging Dev Server

- **When to use**: Test in staging-like development mode
- **Requirements**: None
- **What it does**: Development server with staging environment variables
- **Use case**: Testing staging-specific configurations

#### 🌐 Preview Build

- **When to use**: Test production build locally
- **Requirements**: Must run build task first
- **What it does**: Serves the built `dist/` folder locally
- **Use case**: Final testing before deployment

### ✅ Code Quality Tasks

#### ✅ Run Linter

- **When to use**: Check code quality and standards
- **Requirements**: None
- **What it does**: Runs ESLint to identify issues
- **Use case**: Code review and quality assurance

#### 🔧 Fix Linter Issues

- **When to use**: Auto-fix common linting problems
- **Requirements**: None
- **What it does**: Automatically fixes ESLint issues where possible
- **Use case**: Quick cleanup of code issues

#### 🎨 Format Code

- **When to use**: Ensure consistent code formatting
- **Requirements**: None
- **What it does**: Runs Prettier to format all code
- **Use case**: Code cleanup and consistency

#### 🔍 Check Formatting

- **When to use**: Verify code is properly formatted
- **Requirements**: None
- **What it does**: Checks if code matches Prettier rules
- **Use case**: Pre-commit verification

### 📋 Documentation & Project Tasks

#### 📋 Manual Testing Checklist

- **When to use**: Before deployments or after major changes
- **Requirements**: None
- **What it does**: Opens testing checklist document
- **Use case**: Systematic testing process

#### 📊 Create GitHub Issues

- **When to use**: Set up project roadmap issues
- **Requirements**: GitHub CLI (`gh`) installed and authenticated
- **What it does**: Creates GitHub issues from predefined roadmap
- **Use case**: Project planning and issue tracking

#### 📚 Open Deployment Guide

- **When to use**: When you need deployment reference
- **Requirements**: None
- **What it does**: Opens deployment documentation
- **Use case**: Reference during deployment process

## Recommended Workflow

### Daily Development

1. **🛠️ Dev Server** - Start development
2. **🎨 Format Code** - Before committing
3. **✅ Run Linter** - Check quality
4. **🔧 Fix Linter Issues** - Auto-fix problems

### Feature Development

1. **🌿 Create New Branch** - Start new feature
2. **🛠️ Dev Server** - Develop feature
3. **🧬 Rebase Current Branch** - Before merging
4. **🧹 Clean Merged Branches** - After merge

### Deployment Process

1. **💾 Backup Data** - Safety first
2. **📋 Manual Testing Checklist** - Test thoroughly
3. **🧪 Deploy to Staging** - Test in staging
4. **🚀 Deploy to Production** - Go live

### Emergency Situations

1. **🔄 Rollback Options** - Assess situation
2. **🔴 Emergency Rollback** - If critical
3. **🚨 Quick Deploy + Format** - If minor fix needed

## Tips

### Keyboard Shortcuts

- Set up custom keybindings for frequently used tasks
- `Ctrl+Shift+P` is your friend for quick access

### Task Groups

- **Build**: Deployment and build tasks
- **Test**: Code quality and testing tasks

### Panel Management

- Most tasks open in new panels to avoid conflicts
- Long-running tasks (servers) use dedicated panels
- One-off tasks use shared panels

### Error Handling

- Tasks will stop on errors to prevent bad deployments
- Check terminal output for detailed error messages
- Most deployment tasks have built-in safety checks

### Monitoring

- Keep an eye on task output
- Background tasks show status in terminal tabs
- Failed tasks will show error indicators

Last Updated: 2025-08-01
Version: 1.0.0
