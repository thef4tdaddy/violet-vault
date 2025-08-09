# VioletVault 💜

**A comprehensive cash management system** with advanced envelope budgeting, intelligent automation, and professional-grade infrastructure. Bringing the traditional cash envelope method into the digital age with end-to-end encryption, smart distribution, and real-time collaboration.

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

- Firebase for cloud storage and real-time sync
- Cloudflare Workers for bug reporting and API services
- Cloudflare R2 for secure screenshot storage with cost protection
- Web Crypto API for client-side encryption
- Local Storage for offline functionality and intelligent caching

**Development:**

- ESLint + Prettier for code quality
- Husky + Commitlint for git hooks
- Release Please for automated releases

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## 🏗️ Project Structure

```
src/
├── components/                     # React components
│   ├── analytics/                     # Analytics & insights
│   │   ├── ChartsAndAnalytics.jsx        # Financial analytics dashboard
│   │   └── SmartCategoryManager.jsx      # AI category optimization
│   ├── budgeting/                     # Advanced budget management
│   │   ├── CreateEnvelopeModal.jsx       # Advanced envelope creation with auto-funding
│   │   ├── EditEnvelopeModal.jsx         # Enhanced envelope editing
│   │   ├── EnvelopeGrid.jsx              # Smart envelope visualization
│   │   ├── PaycheckProcessor.jsx         # Intelligent paycheck allocation
│   │   ├── PaydayPrediction.jsx          # Expected payday forecasting
│   │   └── SmartEnvelopeSuggestions.jsx  # AI recommendations (collapsible)
│   ├── bills/                         # Enhanced bill management
│   │   ├── AddBillModal.jsx             # Redesigned bill creation modal
│   │   └── BillManager.jsx              # Bill tracking with compact layouts
│   ├── feedback/                      # Professional bug reporting
│   │   └── BugReportButton.jsx          # Integrated bug reporter with screenshots
│   ├── layout/                        # Modern layout architecture
│   │   ├── MainLayout.jsx               # Refactored responsive layout
│   │   ├── NavigationTabs.jsx           # Enhanced tab navigation
│   │   ├── SummaryCards.jsx             # Improved summary displays
│   │   └── ViewRenderer.jsx             # Smart view rendering logic
│   ├── modals/                        # Smart modal system
│   │   └── UnassignedCashModal.jsx      # One-click cash distribution
│   ├── savings/                       # Advanced savings management
│   │   └── SavingsGoals.jsx             # Goal tracking with automation
│   ├── transactions/                  # Enhanced transaction system
│   │   ├── TransactionLedger.jsx        # Optimized transaction history
│   │   └── TransactionSplitter.jsx      # Advanced transaction splitting
│   └── ui/                           # Enhanced UI components
│       ├── EditableBalance.jsx          # Real-time balance editing
│       ├── Header.jsx                   # Improved header with better spacing
│       └── VersionFooter.jsx            # Smart environment detection
├── hooks/                          # Custom React hooks
│   ├── useActualBalance.js             # Balance calculation logic
│   ├── useBugReport.js                 # Bug reporting functionality
│   └── useUnassignedCashDistribution.js # Cash distribution logic
├── stores/                         # Modern Zustand state management
│   ├── authStore.jsx                   # Unified authentication store
│   └── budgetStore.js                  # Enhanced budget state management
├── utils/                          # Advanced utility functions
│   ├── encryption.js                   # Client-side encryption
│   ├── firebaseConfig.js              # Firebase configuration
│   ├── firebaseSync.js                # Enhanced cloud synchronization
│   ├── frequencyCalculations.js       # Payment frequency utilities
│   ├── paydayPredictor.js             # Paycheck prediction algorithms
│   └── version.js                     # Smart version management with caching
└── App.jsx                         # Main application entry point

cloudflare-worker/                  # Professional bug reporting backend
├── bug-report-worker.js               # Main worker with GitHub integration
├── wrangler.toml                      # Cloudflare configuration
└── README.md                          # Worker setup and deployment guide
```

## 🔐 Security

VioletVault takes your financial privacy seriously:

- **End-to-End Encryption**: All sensitive data is encrypted client-side before storage
- **Password-Based Encryption**: Uses PBKDF2 with 100,000 iterations for key derivation
- **No Server-Side Decryption**: Your master password never leaves your device
- **Device Fingerprinting**: Additional protection against unauthorized access

## 📚 Documentation

### Core Documentation

- **[📋 Roadmap](ROADMAP.md)** - See what's coming next and help shape VioletVault's future
- **[🤝 Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[📝 Changelog](CHANGELOG.md)** - Complete version history and changes

### Technical Documentation

- **[🏗️ Milestones](docs/MILESTONES.md)** - Release planning and milestone tracking
- **[🧪 Testing Strategy](docs/Testing-Strategy.md)** - Comprehensive testing approach
- **[⚠️ Lint Warnings](docs/LINT_WARNINGS.md)** - ESLint warning tracking and resolution
- **[🔄 Refactoring Analysis](docs/Refactoring-Analysis.md)** - Architecture improvement plans
- **[🛠️ New Utilities Analysis](docs/New-Utilities-Analysis.md)** - Feature analysis and utilities

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

### 🎯 What This Means:

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
