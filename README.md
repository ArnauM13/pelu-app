# 🏪 PeluApp - Hair Salon Booking Management System

[![Angular](https://img.shields.io/badge/Angular-20.1.2-red.svg)](https://angular.io/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-20.0.0-blue.svg)](https://primeng.org/)
[![Firebase](https://img.shields.io/badge/Firebase-20.0.1-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://github.com/ArnauM13/pelu-app/actions)
[![Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen.svg)](https://github.com/ArnauM13/pelu-app/actions)

A modern web application for hair salon booking management developed with Angular 20, PrimeNG, and Firebase. It offers a complete solution for appointment management with an intuitive interface and advanced features.

## ✨ Key Features

- ✅ **Booking System**: Real-time appointment creation and management with validation
- ✅ **Drag & Drop Calendar**: Visual appointment management with real-time reorganization
- ✅ **Role-Based Access Control**: Multi-level permissions (Admin/User/Guest)
- ✅ **Multi-language Support**: Complete support for Catalan, Spanish, English, and Arabic with RTL
- ✅ **Responsive Design**: Optimized for mobile, tablet, and desktop
- ✅ **Unified Notifications**: Toast system with multiple types and consistent styling
- ✅ **Clean Code**: ESLint and Prettier configured to maintain standards
- ✅ **Comprehensive Testing**: Full coverage with Jasmine, Karma, and Cypress
- ✅ **Performance Optimized**: Fast loading and smooth UX

## 🛠️ Tech Stack

- **Frontend**: Angular 20.1.2
- **UI Framework**: PrimeNG 20.0.0 + PrimeFlex 4.0.0
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **State Management**: Angular Signals
- **Styling**: SCSS + CSS Variables
- **Testing**: Jasmine + Karma + Cypress
- **Code Quality**: ESLint + Prettier
- **Build Tool**: Angular CLI

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.x LTS or higher
- **npm**: 9.x or yarn 1.22+
- **Angular CLI**: 20.1.1+
- **Git**: 2.30+

### Installation

```bash
# Clone the repository
git clone https://github.com/ArnauM13/pelu-app.git
cd pelu-app

# Install dependencies
npm install

# Setup Firebase (optional)
npm run setup:firebase

# Verify installation
npm run lint:format
npm test

# Start development server
npm start
```

The application will be available at `http://localhost:4200`

## 📋 Available Scripts

```bash
# Development
npm start              # Development server (http://localhost:4200)
npm run build          # Production build
npm run watch          # Watch mode for development

# Testing
npm test               # Unit tests with Karma
npm run test:coverage  # Tests with coverage report
npm run e2e            # End-to-end tests with Cypress

# Code Quality
npm run lint           # Check for linting errors
npm run lint:fix       # Fix errors automatically
npm run format:fix     # Format code with Prettier
npm run lint:format    # Combined lint + format

# Deployment
npm run build:prod     # Optimized production build
firebase deploy        # Deploy to Firebase
```

## 🏗️ Project Architecture

### Directory Structure

```
pelu-app/
├── src/
│   ├── app/
│   │   ├── core/                     # Core services and business logic
│   │   │   ├── auth/                 # Authentication and authorization
│   │   │   ├── guards/               # Route guards
│   │   │   ├── services/             # Shared services
│   │   │   └── interceptors/         # HTTP interceptors
│   │   ├── features/                 # Feature modules
│   │   │   ├── admin/                # Administration features
│   │   │   ├── appointments/         # Appointment management
│   │   │   ├── auth/                 # Authentication pages
│   │   │   ├── bookings/             # Booking system
│   │   │   ├── calendar/             # Calendar component
│   │   │   ├── landing/              # Landing page
│   │   │   ├── profile/              # Profile management
│   │   │   └── services/             # Service management
│   │   ├── shared/                   # Shared components
│   │   │   ├── components/           # Reusable UI components
│   │   │   ├── pipes/                # Custom pipes
│   │   │   └── services/             # Shared services
│   │   └── ui/                       # UI components
│   │       ├── layout/               # Main layout
│   │       └── navigation/           # Navigation
│   ├── assets/
│   │   ├── i18n/                     # Translation files
│   │   │   ├── ca.json               # Catalan
│   │   │   ├── es.json               # Spanish
│   │   │   ├── en.json               # English
│   │   │   └── ar.json               # Arabic
│   │   └── images/                   # Optimized images
│   ├── environments/                 # Environment configurations
│   └── testing/                      # Testing configuration
├── .prettierrc                       # Prettier configuration
├── .eslintrc.json                   # ESLint configuration
├── firebase.json                     # Firebase configuration
├── firestore.rules                   # Security rules
└── firestore.indexes.json           # Firestore indexes
```

### Design Patterns

- **Feature-based Architecture**: Organization by functionality
- **Shared Components**: Component reusability
- **Service Layer**: Centralized business logic
- **Reactive Programming**: RxJS for state management
- **Dependency Injection**: Angular's DI system
- **Signal-based State Management**: Reactive state with Angular Signals

## 🧩 Core Components

### Unified Input System

Complete input system with consistent styling:

- **8 input types**: text, textarea, email, password, number, date, select, checkbox
- **Unified sizing**: 44px for inputs, 80px for textareas
- **Visual states**: normal, focus, error, success, disabled
- **Integrated validation** and **full accessibility**

### UI Components

- `CardComponent`: Container with consistent styling
- `LoaderComponent`: Loading indicator
- `ToastComponent`: Temporary notifications
- `PopupModalComponent`: Reusable modals
- `AvatarComponent`: User avatars
- `ServiceCardComponent`: Service cards

### Advanced Features

- **Interactive Calendar**: Drag & drop, visual states, break management
- **Permission System**: Multiple roles with guards and interceptors
- **Multi-language**: 4 languages with RTL support and dynamic translation
- **Synchronization**: Custom events and cache management

## 🔧 Development Guide

### Creating Components

```bash
# Generate component with Angular CLI
ng generate component shared/components/new-component

# Generate standalone component
ng generate component shared/components/new-component --standalone
```

### Code Quality

The project has ESLint and Prettier configured to maintain clean and consistent code.

```bash
# Before committing
npm run lint:format

# For daily development
npm run format:fix
```

### Testing

```bash
# Unit tests
npm test

# Tests with coverage
npm run test:coverage

# End-to-end tests
npm run e2e
```

### State Management with Signals

```typescript
export class MyComponent {
  // Signals for reactive state
  private readonly dataSignal = signal<any[]>([]);
  private readonly loadingSignal = signal<boolean>(false);

  // Computed values
  readonly hasData = computed(() => this.dataSignal().length > 0);

  // Methods to update state
  updateData(newData: any[]) {
    this.dataSignal.set(newData);
  }
}
```

## 🚀 Deployment

### Firebase Configuration

1. Create Firebase project
2. Configure Firestore Database
3. Configure Authentication
4. Configure Hosting

### Production Deployment

```bash
# Production build
npm run build

# Deploy to Firebase
firebase deploy
```

## 📚 Documentation

### Main Documentation

- **[DOCUMENTATION.md](DOCUMENTATION.md)**: Complete project documentation
- **[DOCS_INDEX.md](DOCS_INDEX.md)**: Index of all available documentation
- **[LINT_FORMAT_GUIDE.md](LINT_FORMAT_GUIDE.md)**: Lint and format guide

### Specific Guides

- [Input System](src/app/shared/components/inputs/README.md)
- [Service Synchronization](src/app/core/services/SERVICES_SYNC.md)
- [Action Visibility](src/app/shared/components/detail-view/ACTIONS_VISIBILITY.md)
- [Mobile Booking Flow](src/app/features/bookings/booking-mobile-page/MOBILE_BOOKING_FLOW.md)

### External Resources

- [Angular Documentation](https://angular.dev/)
- [PrimeNG Documentation](https://primeng.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Develop changes
4. Run tests and lint (`npm run lint:format`)
5. Create Pull Request

### Code Standards

- **TypeScript**: Strict configuration
- **ESLint**: Linting rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit format

### Testing Requirements

- **Minimum coverage**: 80%
- **Unit tests**: For all components
- **Integration tests**: For critical flows
- **E2E tests**: For main features

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ArnauM13/pelu-app/issues)
- **Documentation**: [Complete Documentation](DOCUMENTATION.md)
- **Email**: support@peluapp.com

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Angular Team](https://angular.io/) for the amazing framework
- [PrimeNG Team](https://primeng.org/) for the UI components
- [Firebase Team](https://firebase.google.com/) for the backend services

