# VioletVault 💜

**A comprehensive cash management system** with advanced envelope budgeting, intelligent automation, and professional-grade infrastructure. Bringing the traditional cash envelope method into the digital age with end-to-end encryption, smart distribution, and real-time collaboration.

🎯 **Current Status:** v2.0.0 Baseline Complete - Full TypeScript conversion, Unified Data Model (Envelopes + Transactions), React 19, and modern glassmorphic UI. Now targeting v2.1 Intelligent Automation (March 2026).

[![CI](https://github.com/thef4tdaddy/violet-vault/workflows/CI/badge.svg)](https://github.com/thef4tdaddy/violet-vault/actions)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## 🚀 Features

### 💰 Advanced Cash Management

- **Smart Envelope System** - Advanced envelope budgeting with auto-funding and intelligent classification
- **Unassigned Cash Distribution** - One-click distribution modal for efficient cash allocation
- **Manual Balance Override** - Real-time balance editing directly on the dashboard
- **Negative Balance Support** - Handle overspending scenarios with smart recovery suggestions
- **Variable Expense Envelopes** - Automatic categorization and funding for irregular expenses
- **Expected Payday Prediction** - Intelligent paycheck forecasting and automated allocation
- **Bill Management** - Enhanced bill tracking with compact multi-row layouts
- **Savings Goals** - Advanced goal tracking with progress monitoring and automation
- **Transaction Ledger** - Complete transaction history with enhanced reconciliation tools
- **Smart Deletion System** - Professional modals for bill/envelope deletion with relationship handling

### 🔒 Security & Privacy

- **Client-Side Encryption** - All data encrypted using AES-GCM with PBKDF2 key derivation
- **Password Protection** - Master password required to access your budget
- **Enhanced Password Rotation** - Secure password updates with improved encryption handling
- **Device Fingerprinting** - Additional security layer for multi-device access
- **Privacy First** - Your financial data never leaves your device unencrypted
- **Professional Bug Reporting** - Secure issue reporting with screenshot capture and privacy protection

### 👥 Collaboration

- **Multi-User Support** - Share budgets with family members or partners
- **Real-Time Sync** - See changes instantly across all devices
- **Privacy-Preserving WebSocket Signaling** - Optional real-time sync notifications (signals only, no data transmission)
- **Conflict Resolution** - Smart handling of simultaneous edits
- **Activity Tracking** - Monitor who made what changes and when

### 📊 Analytics & Insights

- **Visual Charts** - Spending trends and budget performance analytics
- **Cash Flow Summary** - Overview of your financial health
- **Smart Bill Matching** - Automatically categorize transactions
- **Spending Analysis** - Detailed breakdowns by category and time period
- **Smart Envelope Suggestions** - AI-powered recommendations based on spending patterns (collapsible interface)
- **Transaction Splitting** - Split complex transactions across multiple envelopes
- **Smart Bill Matching** - Automatically categorize and assign bills to appropriate envelopes

### 🐛 Professional Bug Reporting & Monitoring

- **Integrated Bug Reporter** - One-click bug reporting with automatic environment capture
- **Cloudflare Worker Backend** - Professional-grade issue processing and GitHub integration
- **Screenshot Capture** - Automatic screenshot attachment with privacy-safe R2 storage
- **Usage Analytics** - Built-in monitoring with cost protection and automated cleanup
- **Smart Environment Detection** - Automatic detection of development, preview, and production builds
- **Issue Tracking Integration** - Direct GitHub issue creation with comprehensive metadata

### ⚡ Advanced Technical Features

- **Progressive Enhancement** - Automatic fallback to client-side logic when backend unavailable
  - Client-side CSV/JSON parser as fallback for import service
  - Local budget calculations when Go engine unreachable
  - Service availability tracking with health checks
  - Real-time service status indicators in UI
- **Offline Support** - Works without internet, syncs when reconnected
- **Performance Optimized** - Virtual scrolling and intelligent caching for large datasets
- **Smart Caching System** - 7-day localStorage cache with automatic invalidation
- **Multi-Environment Support** - Local development, Vercel preview, and production detection
- **Version Management** - Release-please integration with dynamic version targeting
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modern Architecture** - Zustand state management with custom hooks and providers
- **Collapsible UI Elements** - Smart suggestions panel can be collapsed for better space utilization

## 🛠️ Tech Stack

**Frontend:**

- React 19 with TypeScript (strict mode)
- Zustand for UI state management
- React Context for authentication state
- TanStack Query v5 for server state
- Vite 7 for fast development and building
- Tailwind CSS 4 for responsive styling
- Recharts for data visualization
- Lucide React for icons

**Backend & Infrastructure:**

- **Polyglot Backend (v2.0)** - Go + Python serverless functions on Vercel
  - Go for bug report GitHub API proxy (secrets handling)
  - Python for financial intelligence (payday prediction, merchant analysis, integrity audits)
- Firebase for cloud storage and real-time sync
- Dexie (IndexedDB) for local-first data persistence
- Web Crypto API for client-side encryption
- Local Storage for offline functionality and intelligent caching

**Development:**

- ESLint + Prettier for code quality
- Zod for runtime validation and type safety
- Vitest for unit and integration testing
- Husky + Commitlint for git hooks
- Release Please for automated releases
- **Multi-language tooling** - Go (golangci-lint), Python (ruff, mypy)
- `full_salvo.sh` - Comprehensive multi-language verification script

## ⚠️ v2.0 Breaking Changes

**VioletVault v2.0** is a complete rewrite with a fresh data structure and unified architecture.

### Migration Strategy

**Not supported** - v2.0 starts with a clean slate. Users upgrading from v1.x will start fresh.

### What's New in v2.0

- **Unified Data Model**: Bills, debts, savings goals, and paycheck history are now unified into envelope and transaction tables
- **Fresh Start**: No migration from previous versions - cleaner, simpler codebase
- **Improved Performance**: Optimized database schema with better indexing
- **Type Safety**: Enhanced TypeScript types with Zod validation

### Backup Recommendation

**Before upgrading to v2.0**, users should export their v1.x data if they need historical records. v2.0 does not migrate data from previous versions.

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- **Optional (for backend development):**
  - Go 1.22+ (for bug report API)
  - Python 3.12+ (for analytics API)
  - ruff, mypy (Python tooling: `pip install ruff mypy`)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/thef4tdaddy/violet-vault.git
   cd violet-vault
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase** (optional for cloud sync)
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Copy your config to `src/utils/firebaseConfig.js`

4. **Configure WebSocket Real-Time Signaling** (optional)

   VioletVault supports privacy-preserving real-time sync notifications via WebSocket:
   - Copy `.env.example` to `.env`
   - Set `VITE_WEBSOCKET_ENABLED=true`
   - Set `VITE_WEBSOCKET_URL` to your WebSocket server URL

   **Privacy Note:** WebSocket signaling transmits only metadata signals (e.g., "data changed") - never decrypted data or encrypted blobs. This maintains end-to-end encryption while enabling real-time notifications.

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open your browser** to `http://localhost:5173`

### Python Analytics Service (Optional)

For advanced analytics features like envelope integrity audits:

1. **Navigate to the api directory**

   ```bash
   cd api
   ```

2. **Create and activate virtual environment**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Start the analytics service**

   ```bash
   uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access API documentation** at `http://localhost:8000/docs`

See [api/README.md](api/README.md) for more details.

## 📝 Available Scripts

```bash
# Frontend Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run typecheck    # Run TypeScript type checking

# Backend Development (v2.0 Polyglot)
cd api && go build ./...        # Build Go serverless functions
cd api && go test ./...         # Test Go code
ruff check api/                 # Lint Python code
mypy api/                       # Type check Python code

# Multi-Language Verification
./scripts/full_salvo.sh         # Run all linters/tests (TS/Go/Python)
```

## 📦 Versioning & Release Strategy

VioletVault uses [Release Please](https://github.com/googleapis/release-please) for automated semantic versioning and releases.

### Version Format

- **Feature branches** (`feat/*`): `2.0.0-alpha.N` (incremental alpha releases)
- **Develop branch**: `2.0.0-prerelease.N` (pre-release builds every 10 commits)
- **Main branch**: `2.0.0`, `2.1.0`, etc. (stable releases)

### Release Types

- **Patch releases** (e.g., `2.0.1`): Bug fixes only - automatically deployed
- **Minor releases** (e.g., `2.1.0`): New features - manual deployment approval required
- **Major releases** (e.g., `3.0.0`): Breaking changes - manual deployment approval required

### Automatic Releases

Release Please analyzes commit messages following [Conventional Commits](https://www.conventionalcommits.org/) to determine version bumps:

- `fix:` → Patch version bump (2.0.0 → 2.0.1)
- `feat:` → Minor version bump (2.0.0 → 2.1.0)
- `feat!:` or `BREAKING CHANGE:` → Major version bump (2.0.0 → 3.0.0)

### Pre-release Versioning

- **Develop branch**: Pre-releases are created every 10 commits with format `2.0.0-prerelease.N`
- **Feature branches**: Alpha releases use format `2.0.0-alpha.N` for testing
- Pre-releases are automatically tagged but not published to production

### Triggering a Release

Releases are triggered automatically:

- **Main branch**: On every push with conventional commits
- **Develop branch**: Every 10 commits or manual workflow dispatch
- **Manual trigger**: Use GitHub Actions workflow dispatch for immediate release

See [Release Please Workflow](.github/workflows/release-please.yml) for configuration details.

## 📊 Performance & Bundle Size

VioletVault monitors bundle size to ensure optimal performance:

### Current Bundle Size (Baseline)

- **Total Size**: ~11.07 MB (uncompressed)
- **Gzipped Size**: ~1.56 MB (production delivery)
- **Largest Chunk**: main-\*.js (~547 KB gzipped)
- **Performance Budget**: < 250 KB gzipped for initial load

### Bundle Size Monitoring

The [Bundle Size Monitor workflow](.github/workflows/bundle-size.yml) automatically:

- Measures bundle size on every PR to `main` or `nightly` branches
- Compares against baseline and base branch
- Fails CI if bundle grows >15% from baseline
- Posts detailed size reports as PR comments
- Tracks JS/CSS chunks and identifies largest files

### Optimization Guidelines

- Use dynamic imports for large components
- Leverage code splitting for routes
- Monitor bundle report in CI comments
- Keep main bundle under 100 KB gzipped when possible

## 🏗️ Project Structure

VioletVault v2.0 is organized into a comprehensive modular TypeScript architecture:

```text
violet-vault/
├── api/                  # v2.0 Polyglot Backend (Go + Python)
│   ├── bug-report.go        # Go: Bug report GitHub API proxy
│   ├── analytics.py         # Python: Financial intelligence engine
│   ├── go.mod              # Go module dependencies
│   └── README.md           # Backend API documentation
├── src/
│   ├── components/           # React components (TypeScript)
│   │   ├── analytics/           # Financial analytics & reporting
│   │   ├── automation/          # Auto-funding and smart rules
│   │   ├── budgeting/           # Envelope management system
│   │   ├── bills/              # Bill tracking and management
│   │   ├── auth/               # Authentication and security
│   │   ├── settings/           # Configuration and preferences
│   │   └── shared/             # Shared UI components
│   ├── hooks/               # Custom React hooks (TypeScript)
│   ├── stores/              # Zustand state management (TypeScript)
│   ├── services/            # Business logic and API services
│   │   ├── sync/               # Firebase sync providers
│   │   ├── analytics/          # Analytics API integration (Python)
│   │   ├── logging/            # Bug reporting service (Go)
│   │   └── types/              # Type-safe service interfaces
│   ├── utils/               # Utility functions and helpers
│   ├── domain/              # Pure domain logic (decoupled)
│   ├── db/                  # Dexie database schemas
│   └── App.tsx              # Main application entry point
├── scripts/
│   └── full_salvo.sh        # Multi-language verification script
├── pyproject.toml          # Python tooling configuration
└── vercel.json             # Vercel serverless deployment config
```

📋 **For complete directory structure and file descriptions**, see [Source Code Directory](docs/architecture/Source-Code-Directory.md)

## 🔐 Security

VioletVault takes your financial privacy seriously:

- **End-to-End Encryption**: All sensitive data is encrypted client-side before storage
- **Password-Based Encryption**: Uses PBKDF2 with 100,000 iterations for key derivation
- **No Server-Side Decryption**: Your master password never leaves your device
- **Device Fingerprinting**: Additional protection against unauthorized access

## 📚 Documentation

### Documentation Index

For a complete overview of all documentation in the repository, see the **[Documentation Index](docs/DOCUMENTATION_INDEX.md)**, which provides a comprehensive listing of all documentation files organized by category and location.

### Core Documentation

- **[📋 Documentation Index](docs/DOCUMENTATION_INDEX.md)** - Complete listing of all documentation
- **[🏗️ Milestones](docs/guides/MILESTONES.md)** - Release planning and 2026 roadmap
- **[🤝 Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[📝 Changelog](CHANGELOG.md)** - Complete version history and changes
- **[🔄 v2.0 Migration Guide](docs/migration/v2.0-migration-guide.md)** - Guide for migrating to v2.0

### Technical Documentation

- **[🎨 Shared UI Components](docs/shared-ui/index.md)** - Standardized components and design patterns
- **[🏗️ Source Code Directory](docs/architecture/Source-Code-Directory.md)** - Complete codebase map
- **[� Firebase Services](docs/architecture/TypedFirebaseServices.md)** - Type-safe sync architecture
- **[🧠 Client State Management](docs/architecture/Client-State-Management.md)** - Zustand & Context patterns
- **[� Data Model](docs/architecture/DATA_MODEL_SIMPLIFICATION.md)** - Unified Envelope/Transaction model
- **[🔌 API Development Guide](docs/api/API-Development-Guide.md)** - Complete API documentation with OpenAPI specification
- **[� Production Deployment](docs/guides/Production-Deployment-Guide.md)** - Branch strategy and release cycle
- **[❓ Troubleshooting FAQ](docs/guides/Troubleshooting-FAQ.md)** - Common issues and solutions

### API Documentation

VioletVault provides comprehensive API documentation with OpenAPI 3.0 specification:

- **[📖 Interactive API Docs](/api-docs)** - Swagger UI with live API testing (available when running the app)
- **[📋 API Development Guide](docs/api/API-Development-Guide.md)** - Complete developer guide with examples
- **[📄 OpenAPI Spec](/openapi.json)** - Download the OpenAPI specification

#### Key API Endpoints

- **AutoFunding Simulation API** (`/api/autofunding`): Python-based serverless function for smart funding simulations
- **Bug Report Worker**: Submit bug reports with screenshots
- **Cloud Sync**: Encrypted data synchronization with Firebase
- **Budget Data**: Local database operations for envelopes, transactions, and bills

See the [API Development Guide](docs/API-Development-Guide.md) and [Python API README](api/README.md) for detailed usage examples and authentication information.

## 🗺️ Roadmap

Check out our development progress:

- **[📋 Roadmap Document](ROADMAP.md)** - Detailed feature roadmap and vision
- **[📊 GitHub Project](https://github.com/thef4tdaddy/violet-vault/projects)** - Live project board with current development status
- **[🏗️ Milestones](docs/MILESTONES.md)** - Weekly release planning and milestone tracking

See what's coming next and help shape VioletVault's future!

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Create a new branch**

   ```bash
   npm run create-branch  # Uses our automated branch creation script
   # Or manually: git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Write code following our ESLint/Prettier configuration
   - Add tests if applicable
   - Update documentation as needed

3. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

   We use [Conventional Commits](https://www.conventionalcommits.org/) format.

4. **Push and create a PR**

   ```bash
   git push origin your-branch
   ```

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**.

### 🎯 What This Means

**✅ You CAN:**

- Use VioletVault for personal budgeting and self-hosting
- Use it internally within your organization (non-commercially)
- Modify and improve the software
- Share it with others (non-commercially)
- Learn from the code and use it for education

**❌ You CANNOT (without permission):**

- Use VioletVault to build commercial services or products
- Sell access to VioletVault or derivatives
- Keep your improvements private (must share back)

**💡 Commercial Use:**
For commercial licensing options, please [contact us](https://github.com/thef4tdaddy/violet-vault/issues) to discuss terms.

See the [LICENSE](LICENSE) file for complete details.

## 📖 Quick Reference

| Topic               | Link                                                                   | Description                |
| ------------------- | ---------------------------------------------------------------------- | -------------------------- |
| **Getting Started** | [Installation](#-getting-started)                                      | Set up VioletVault locally |
| **Features**        | [Feature List](#-features)                                             | Complete feature overview  |
| **Development**     | [Contributing Guide](CONTRIBUTING.md)                                  | Development workflow       |
| **Architecture**    | [Project Structure](#-project-structure)                               | Codebase organization      |
| **Roadmap**         | [GitHub Project](https://github.com/thef4tdaddy/violet-vault/projects) | Live development board     |
| **Planning**        | [Milestones](docs/MILESTONES.md)                                       | Weekly release planning    |
| **Testing**         | [Testing Strategy](docs/Testing-Strategy.md)                           | QA approach                |

## 🆘 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/thef4tdaddy/violet-vault/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/thef4tdaddy/violet-vault/discussions)
- 📚 **Documentation**: See our [Documentation Section](#-documentation) above

## 🙏 Acknowledgments

- Built with ❤️ for people who want to take control of their finances
- Inspired by the time-tested envelope budgeting method
- Designed with privacy and security as core principles

---

**VioletVault** - Your money, your privacy, your control. 💜
