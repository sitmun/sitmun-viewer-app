# SITMUN Viewer Application

[![License: EUPL v1.2](https://img.shields.io/badge/License-EUPL%20v1.2-blue.svg)](LICENSE)

The **SITMUN Viewer Application** is the official web-based frontend for visualizing and interacting with geospatial applications managed by the SITMUN platform. Built with TypeScript and Angular 16, it provides an intuitive map viewing interface that integrates seamlessly with the [SITMUN Backend Core](https://github.com/sitmun/sitmun-backend-core) REST API.

## Table of Contents

- [About SITMUN](#about-sitmun)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Integration](#api-integration)
- [Security](#security)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## About SITMUN

SITMUN is a comprehensive geospatial information management system designed for organizations that need to manage territorial information, geographical services, and spatial applications. The Viewer Application provides the end-user interface for:

- **🗺️ Interactive Map Visualization**: High-performance web mapping with multiple base layers
- **📍 Geospatial Data Interaction**: Feature information, search, and location services
- **🎛️ Configurable Controls**: Customizable map tools and interface components
- **📊 Layer Management**: Dynamic layer activation, styling, and legend display
- **🔍 Advanced Search**: Geographic and attribute-based search capabilities
- **📱 Responsive Design**: Mobile-first approach for any device
- **🌐 Multi-language Support**: Internationalization for CA, ES, EN, FR

This frontend integrates with the [SITMUN Backend Core](https://github.com/sitmun/sitmun-backend-core) and complements the [SITMUN Administration Application](https://github.com/sitmun/sitmun-admin-app) for a complete geospatial platform.

## Features

### Core Mapping Features

- 🗺️ **Interactive Mapping**: High-performance web mapping using SITNA (Sistema de Información Territorial de Navarra)
- 📍 **Geolocation Services**: GPS positioning and location-based services
- 🔍 **Search & Query**: Geographic search, feature queries, and WFS data access
- 📊 **Layer Visualization**: Dynamic layer management with styling and transparency
- 📏 **Measurement Tools**: Distance, area, and drawing/markup capabilities
- 🖨️ **Map Export**: Print and download functionality for maps and data
- 📱 **Street View Integration**: Google Street View integration for enhanced visualization

### Technical Features

- 📱 **Responsive Design**: Mobile-first approach with Angular Material 16.x
- 🌐 **Internationalization**: Support for multiple languages (CA, ES, EN, FR)
- 🎨 **Customizable UI**: Configurable interface with material design
- 🚀 **Performance Optimized**: Lazy loading and efficient rendering
- 🔧 **SITNA Integration**: Advanced mapping capabilities through SITNA library v3.0.1
- 🔐 **ServiceWorker**: Authentication token management for API requests

## Quick Start

### Prerequisites

- **Node.js**: Version 16.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 8.x or higher (comes with Node.js)
- **SITMUN Backend Core**: Running instance ([Setup Guide](https://github.com/sitmun/sitmun-backend-core))

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/sitmun/sitmun-application-stack.git
cd sitmun-application-stack/front/viewer/sitmun-viewer-app

# Install dependencies
npm ci

# Start development server
npm start

# Open browser to http://localhost:4200
```

The application will connect to a backend at `https://sitmun-backend-core.herokuapp.com` by default.

## Installation

### Development Installation

1. **Clone the Repository**

```bash
git clone https://github.com/sitmun/sitmun-application-stack.git
cd sitmun-application-stack/front/viewer/sitmun-viewer-app
```

2. **Install Dependencies**

```bash
# Install all dependencies (recommended for CI/CD)
npm ci

# Or install with package-lock.json update
npm install
```

3. **Verify Installation**

```bash
# Check Angular CLI version
npx ng version

# Run linting
npm run lint

# Run tests
npm test
```

## Configuration

### OpenSSL Legacy Provider Requirement

This project requires the legacy OpenSSL provider (`--openssl-legacy-provider`) due to dependencies in the SITNA mapping library and cryptographic operations. This requirement is automatically handled by the build script.

**Why is this needed?**

- **SITNA Library**: The core mapping library uses legacy cryptographic functions (CryptoJS, PDF generation)
- **JWT Processing**: Token handling uses legacy algorithms for compatibility
- **Webpack Bundling**: Large external libraries require legacy Node.js module compatibility
- **Geospatial Security**: Data encryption operations use legacy OpenSSL algorithms

**Impact:**

- The build script automatically sets `NODE_OPTIONS=--openssl-legacy-provider`
- This ensures compatibility with Node.js 16+ while maintaining security
- No manual configuration required for developers

### Environment Configuration

The application supports multiple environment configurations:

| Environment                | File                            | API Base URL                                | Hash Strategy | Production |
| -------------------------- | ------------------------------- | ------------------------------------------- | ------------- | ---------- |
| **Default**                | `environment.ts`                | `https://sitmun-backend-core.herokuapp.com` | true          | false      |
| **Development**            | `environment.development.ts`    | `http://localhost:8080`                     | false         | false      |
| **Development API Heroku** | `environment.testdeployment.ts` | `https://sitmun-backend-core.herokuapp.com` | false         | false      |
| **Test Deployment**        | `environment.testdeployment.ts` | `https://sitmun-backend-core.herokuapp.com` | false         | true       |

### Environment Variables

Configure the following variables in your environment files:

```typescript
export const environment = {
  hashLocationStrategy: boolean, // Enable hash-based routing
  apiUrl: string // Backend API base URL
};
```

### Build Configuration

Build for specific environments:

```bash
# Development build
npm run build -- --configuration=development

# Development with Heroku API
npm run build -- --configuration=development-api-heroku

# Test deployment build
npm run build -- --configuration=testdeployment

# Production build
npm run build -- --configuration=production

# Production build with custom base href
npm run build -- --configuration=production --base-href=/viewer/
```

### Build Process Details

The build process automatically handles:

- **OpenSSL Legacy Provider**: Sets `NODE_OPTIONS=--openssl-legacy-provider` for compatibility
- **Environment Replacement**: Automatically replaces environment files based on configuration
- **Asset Optimization**: Optimizes and hashes assets for production builds
- **Bundle Splitting**: Creates vendor chunks for better caching
- **Source Maps**: Generates source maps for development builds

## Development

### Development Server

```bash
# Start development server
npm start

# Start with specific configuration
npm run build -- --configuration=development
ng serve --configuration=development

# Start with Heroku API configuration
ng serve --configuration=development-api-heroku

# Start with custom port
ng serve --port 4300

# Start with open browser
ng serve --open
```

### Code Generation

```bash
# Generate new component
ng generate component components/my-component

# Generate new service
ng generate service services/my-service

# Generate new module
ng generate module modules/my-module --routing
```

### Code Quality

```bash
# Run linting (includes ESLint and Prettier)
npm run lint

# Run tests
npm test

# Build with watch mode
npm run watch
```

## Testing

### Unit Testing

```bash
# Run tests once
npm test

# Run tests with coverage
npm test -- --code-coverage

# Run tests in watch mode
npm test -- --watch

# Run linting
npm run lint
```

## Deployment

## API Integration

### Backend Integration

The application integrates with the [SITMUN Backend Core](https://github.com/sitmun/sitmun-backend-core) REST API:

#### Authentication Endpoints

```
// Login
POST /api/authenticate
{
  "username": "user",
  "password": "password"
}

// Get current user account
GET /api/account
Authorization: Bearer <jwt-token>

// User verification
POST /api/user-verification/verify-password
POST /api/user-verification/verify-email

// Password recovery
POST /api/recover-password

// Token validation
GET /api/userTokenValid
```

#### Core API Endpoints

```http
// Applications
GET /api/config/client/application

// Territories
GET /api/config/client/territory

// User configuration
GET /api/account/public/{id}

// Map configuration
GET /api/config/client/profile/{appId}/{territoryId}
```

### SITNA Integration

The application uses the **SITNA (Sistema de Información Territorial de Navarra) library v3.0.1** for advanced mapping capabilities:

**Version Information:**

- **SITNA API Version**: 3.0.1 [10/10/2023, 9:59:28]
- **TC Library Version**: 3.0.0 [2022-12-7 13:49:07]
- **OpenLayers Integration**: Built-in OpenLayers support
- **Build Date**: October 10, 2023

#### **Core Mapping Features**

- **Interactive Map Controls**: Pan, zoom, full-screen, overview map
- **Base Map Selection**: Multiple base layer options with thumbnails
- **Layer Catalog**: Organized layer browser with folder structure
- **Feature Information**: Click-based feature information display
- **Work Layer Manager**: User-added layer management
- **Coordinates Display**: Real-time coordinate information
- **Scale Controls**: Scale bar, selector, and display

#### **Advanced Tools**

- **Street View Integration**: Google Maps Street View with panorama controls
- **Measurement Tools**: Distance, area, and drawing/markup capabilities
- **Export Functionality**: Map images, vector data (GPX/KML), Excel export
- **Print Maps**: High-quality map printing with custom layouts
- **Geolocation**: GPS positioning and location-based services
- **Search & Query**: Geographic search, feature queries, WFS data access
- **External WMS**: Integration with external WMS services

#### **SITMUN-Specific Enhancements**

- **Custom Controls**: SITMUN-specific control implementations
- **Enhanced UI**: Responsive design with mobile-first approach
- **Multi-language Support**: Internationalization for all controls
- **Security Integration**: Authentication-aware layer access
- **Performance Optimizations**: Efficient rendering and caching

## Security

### Authentication and Authorization

- **JWT Tokens**: Secure token-based authentication
- **Route Guards**: Protected routes based on authentication status
- **HTTP Interceptors**: Automatic token handling and error management
- **Session Management**: Secure session handling with token refresh

### Security Features

```typescript
// Route protection
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthenticationGuard]
}

// HTTP token interceptor
@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

## Project Structure

```
src/
├── app/
│   ├── api/                    # API models and services
│   │   ├── model/             # Data models
│   │   └── services/          # Backend services
│   ├── auth/                  # Authentication module
│   │   └── services/          # Auth services and guards
│   ├── config/                # Application configuration
│   ├── layout/                # Layout components
│   │   ├── authorized-layout/ # Authenticated user layout
│   │   ├── public-layout/     # Public layout
│   │   ├── navigation-bar/    # Navigation component
│   │   └── footer/           # Footer component
│   ├── sections/              # Feature sections
│   │   ├── authentication/    # Login/register
│   │   ├── public/           # Public map viewer
│   │   ├── user/             # User dashboard and map
│   │   ├── embedded/         # Embedded map viewer
│   │   └── common/           # Shared section components
│   ├── ui/                   # UI components and utilities
│   │   ├── components/       # Reusable components
│   │   ├── modal/           # Modal system
│   │   └── util/            # Utility functions
│   └── notifications/       # Notification system
├── assets/                  # Static assets
│   ├── i18n/               # Translation files
│   ├── img/                # Images and icons
│   ├── js/                 # External libraries
│   │   ├── sitna/          # SITNA mapping library
│   │   ├── patch/          # SITMUN extensions
│   │   └── toastr/         # Notification library
│   ├── logos/              # Logo assets
│   └── map-styles/         # Map styling configurations
├── environments/           # Environment configurations
└── styles/                # Global styles and themes
```

### Key Architecture Decisions

- **Modular Design**: Feature-based module organization
- **Reactive Programming**: RxJS for asynchronous operations
- **Material Design**: Angular Material for consistent UI
- **SITNA Integration**: Advanced mapping through SITNA library v3.0.1

## Contributing

### Development Guidelines

1. **Fork the repository** and create a feature branch
2. **Follow Angular style guide** and project conventions
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Ensure quality checks pass**:

```bash
npm run lint
npm test
npm run build -- --configuration=production
```

**Note**: The build script automatically sets `NODE_OPTIONS=--openssl-legacy-provider` for Node.js compatibility. This is required due to SITNA library dependencies and cryptographic operations that use legacy OpenSSL algorithms.

6. **Submit a pull request** with a clear description

### Conventional Commits

We use [Conventional Commits](https://conventionalcommits.org/) for commit messages:

```bash
# Examples
git commit -m "feat(map): add new layer visualization feature"
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(components): add unit tests for dashboard"
git commit -m "style(formatting): apply prettier formatting"
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Support

### Troubleshooting

#### Common Issues

**Build Errors**

- **OpenSSL Errors**: Ensure Node.js 16+ is used, the build script handles legacy provider automatically
- **Memory Issues**: Large SITNA library may require increased Node.js memory limits
- **Dependency Conflicts**: Use `npm ci` for clean installs

**Runtime Issues**

- **Map Not Loading**: Check backend connectivity and API endpoints
- **Authentication Errors**: Verify JWT token validity and backend authentication
- **Responsive Issues**: Test on different screen sizes, check CSS breakpoints

**Development Issues**

- **Hot Reload Not Working**: Check file watching limits on your system
- **Test Failures**: Ensure Chrome headless is available for Karma tests
- **Linting Errors**: Run `npm run lint` to auto-fix formatting issues

### Getting Help

- **Documentation**: Check this README and inline code documentation
- **Issues**: [GitHub Issues](https://github.com/sitmun/sitmun-application-stack/issues)
- **Backend Issues**: [Backend Core Issues](https://github.com/sitmun/sitmun-backend-core/issues)
- **Admin App Issues**: [Admin App Issues](https://github.com/sitmun/sitmun-admin-app/issues)

### Reporting Issues

When reporting issues, please include:

1. **Environment**: OS, Node.js version, browser
2. **Steps to reproduce**: Clear step-by-step instructions
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Console logs**: Browser console errors

## License

This project is licensed under the **European Union Public Licence V. 1.2** (EUPL-1.2). The EUPL is a copyleft open-source license compatible with major open-source licenses including GPL, AGPL, MPL, and others. See the [LICENSE](LICENSE) file for the full license text.
