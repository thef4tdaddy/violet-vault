# VioletVault 💜

**A secure, encrypted envelope budgeting application** that brings the traditional cash envelope budgeting method into the digital age with end-to-end encryption and real-time collaboration.

[![CI](https://github.com/thef4tdaddy/violet-vault/workflows/CI/badge.svg)](https://github.com/thef4tdaddy/violet-vault/actions)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## 🚀 Features

### 💰 Core Budgeting

- **Envelope System** - Allocate money into virtual envelopes for different expense categories
- **Bill Management** - Track recurring bills and automatically create budget envelopes
- **Savings Goals** - Set and monitor progress toward financial objectives
- **Paycheck Processing** - Automated biweekly allocation based on your bills and goals
- **Transaction Ledger** - Complete transaction history with reconciliation tools

### 🔒 Security & Privacy

- **Client-Side Encryption** - All data encrypted using AES-GCM with PBKDF2 key derivation
- **Password Protection** - Master password required to access your budget
- **Password Change** - Update your master password without losing data
- **Device Fingerprinting** - Additional security layer for multi-device access
- **Privacy First** - Your financial data never leaves your device unencrypted

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

### ⚡ Technical Features

- **Offline Support** - Works without internet, syncs when reconnected
- **Performance Optimized** - Transaction ledger now uses virtual scrolling via `@tanstack/react-virtual` for large datasets
- **Data Pagination** - Displays transactions 10 per page to keep memory usage low
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modular Architecture** - Recently refactored for better maintainability and performance
- **Collapsible UI Elements** - Smart suggestions panel can be collapsed for better space utilization

## 🛠️ Tech Stack

**Frontend:**

- React 18 with Zustand for state management
- Vite for fast development and building
- Tailwind CSS for responsive styling
- Recharts for data visualization
- Lucide React for icons

**Backend & Storage:**

- Firebase for cloud storage and real-time sync
- Web Crypto API for client-side encryption
- Local Storage for offline functionality

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
├── components/              # React components
│   ├── analytics/              # Analytics & insights
│   │   ├── ChartsAndAnalytics.jsx  # Financial analytics dashboard
│   │   └── SmartCategoryManager.jsx # AI category optimization
│   ├── budgeting/              # Budget management
│   │   ├── CreateEnvelopeModal.jsx  # Advanced envelope creation
│   │   ├── EnvelopeGrid.jsx         # Envelope visualization
│   │   ├── PaycheckProcessor.jsx    # Paycheck allocation
│   │   └── SmartEnvelopeSuggestions.jsx # AI envelope recommendations (collapsible)
│   ├── bills/                  # Bill management
│   │   ├── AddBillModal.jsx        # Bill creation/editing modal
│   │   └── BillManager.jsx         # Bill tracking & automation
│   ├── layout/                 # Core layout components
│   │   ├── MainLayout.jsx          # Refactored main layout
│   │   ├── NavigationTabs.jsx      # Tab navigation system
│   │   ├── SummaryCards.jsx        # Summary card components
│   │   ├── ViewRenderer.jsx        # View rendering logic
│   │   └── Layout.jsx              # Legacy layout (being phased out)
│   ├── savings/                # Savings management
│   │   └── SavingsGoals.jsx        # Goal tracking & progress
│   ├── sync/                   # Collaboration features
│   │   └── TeamActivitySync.jsx    # Real-time collaboration
│   └── transactions/           # Transaction management
│       ├── TransactionLedger.jsx   # Transaction history
│       ├── TransactionSplitter.jsx # Split transaction tool
│       └── import/             # Import utilities
│           └── FileUploader.jsx    # Import functionality
├── contexts/               # React contexts
│   ├── AuthContext.jsx        # Authentication & encryption
│   └── BudgetContext.jsx      # Budget data management
├── stores/                 # Zustand state management
│   ├── authStore.js           # Authentication state
│   ├── budgetStore.js         # Modern budget store
│   └── optimizedBudgetStore.js # Performance-optimized store
├── utils/                  # Utility functions
│   ├── encryption.js          # Client-side encryption
│   ├── firebaseConfig.js      # Firebase setup
│   └── firebaseSync.js        # Cloud synchronization
└── App.jsx                 # Main application
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

| Topic | Link | Description |
|-------|------|-------------|
| **Getting Started** | [Installation](#-getting-started) | Set up VioletVault locally |
| **Features** | [Feature List](#-features) | Complete feature overview |
| **Development** | [Contributing Guide](CONTRIBUTING.md) | Development workflow |
| **Architecture** | [Project Structure](#-project-structure) | Codebase organization |
| **Roadmap** | [GitHub Project](https://github.com/thef4tdaddy/violet-vault/projects) | Live development board |
| **Planning** | [Milestones](docs/MILESTONES.md) | Weekly release planning |
| **Testing** | [Testing Strategy](docs/Testing-Strategy.md) | QA approach |

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
