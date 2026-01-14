# VioletVault 💜

**A comprehensive cash management system** with advanced envelope budgeting, intelligent automation, and professional-grade infrastructure. Bringing the traditional cash envelope method into the digital age with end-to-end encryption, smart distribution, and real-time collaboration.

🎯 **Current Status:** v1.10.0 Code Architecture & Refactoring milestone 90% complete - Major UI stabilization across all pages, performance optimizations, centralized icon system, and enhanced security warnings.

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

- React 18 with Zustand for state management
- Vite for fast development and building
- Tailwind CSS for responsive styling
- Recharts for data visualization
- Lucide React for icons

**Backend & Infrastructure:**

- **Polyglot Backend (v2.0)** - Go + Python serverless functions on Vercel
  - Go for bug report GitHub API proxy (secrets handling)
  - Python for financial intelligence (payday prediction, merchant analysis, integrity audits)
- Firebase for cloud storage and real-time sync

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

## 🏗️ Project Structure

VioletVault is organized into a comprehensive modular architecture with **696 files** across major functional areas:

```
violet-vault/
├── api/                  # v2.0 Polyglot Backend (Go + Python)
│   ├── bug-report.go        # Go: Bug report GitHub API proxy
│   ├── analytics.py         # Python: Financial intelligence engine
│   ├── go.mod              # Go module dependencies
│   └── README.md           # Backend API documentation
├── src/
│   ├── components/           # React components (27 major categories)
│   │   ├── analytics/           # Financial analytics & reporting
│   │   ├── automation/          # Auto-funding and smart rules
│   │   ├── budgeting/           # Envelope management system
│   │   ├── bills/              # Bill tracking and management
│   │   ├── auth/               # Authentication and security
│   │   ├── settings/           # Configuration and preferences
│   │   └── [22 more categories]
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state management
│   ├── services/            # Business logic and API services
│   │   ├── analytics/          # Analytics API integration (Python)
│   │   ├── logging/            # Bug reporting service (Go)
│   │   └── [other services]
│   ├── utils/               # Utility functions and helpers
│   └── App.jsx              # Main application entry point
├── scripts/
│   └── full_salvo.sh        # Multi-language verification script
├── pyproject.toml          # Python tooling configuration
└── vercel.json             # Vercel serverless deployment config
```

📋 **For complete directory structure and file descriptions**, see [Source Code Directory](docs/Source-Code-Directory.md)

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
- **[📋 Roadmap](docs/ROADMAP.md)** - See what's coming next and help shape VioletVault's future
- **[🤝 Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute to the project
- **[📝 Changelog](docs/CHANGELOG.md)** - Complete version history and changes
- **[🔄 v2.0 Migration Guide](docs/migration/v2.0-migration-guide.md)** - Guide for migrating to v2.0

### Technical Documentation

- **[🎨 Shared UI Components](docs/Shared-UI-Components.md)** - Standardized components and design patterns
- **[📘 TypeScript Patterns Guide](docs/TypeScript-Patterns-Guide.md)** - JSDoc typing patterns for props, hooks, and Dexie queries
- **[🔌 API Development Guide](docs/API-Development-Guide.md)** - Complete API documentation with OpenAPI specification
- **[🔄 WebSocket Real-Time Signaling](docs/WEBSOCKET_SIGNALING.md)** - Privacy-preserving real-time sync notifications
- **[✅ Component Props Validation](docs/Component-Props-Validation-Guide.md)** - Runtime prop validation with Zod schemas
- **[📝 Zod Integration Guide](docs/ZOD-INTEGRATION-GUIDE.md)** - Comprehensive guide for Zod validation patterns and form hooks
- **[🏗️ Milestones](docs/MILESTONES.md)** - Release planning and milestone tracking
- **[🧪 Testing Strategy](docs/Testing-Strategy.md)** - Comprehensive testing approach
- **[⚠️ Lint Warnings](docs/LINT_WARNINGS.md)** - ESLint warning tracking and resolution
- **[🔄 Refactoring Analysis](docs/Refactoring-Analysis.md)** - Architecture improvement plans
- **[🛠️ New Utilities Analysis](docs/New-Utilities-Analysis.md)** - Feature analysis and utilities
- **[❓ Troubleshooting FAQ](docs/Troubleshooting-FAQ.md)** - Common issues and solutions

### API Documentation

VioletVault provides comprehensive API documentation with OpenAPI 3.0 specification:

- **[📖 Interactive API Docs](/api-docs)** - Swagger UI with live API testing (available when running the app)
- **[📋 API Development Guide](docs/API-Development-Guide.md)** - Complete developer guide with examples
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
