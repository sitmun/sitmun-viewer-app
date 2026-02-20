# SITMUN Viewer Application

[![License: EUPL v1.2](https://img.shields.io/badge/License-EUPL%20v1.2-blue.svg)](LICENSE)
![Version](https://img.shields.io/badge/version-1.2.2-blue.svg)

The **SITMUN Viewer Application** is the Angular 16 frontend for visualizing geospatial applications managed by the SITMUN platform. It integrates with the [SITMUN Backend Core](https://github.com/sitmun/sitmun-backend-core) REST API.

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

SITMUN is a geospatial information management system for territorial data, services, and spatial applications. The Viewer Application provides:

- Interactive map viewing with base layers
- Feature info, search, and location tools
- Layer catalog management and legends
- Map tools (measure, draw, export)
- Responsive UI and i18n (CA, ES, EN, FR)

This frontend integrates with the [SITMUN Backend Core](https://github.com/sitmun/sitmun-backend-core) and complements the [SITMUN Administration Application](https://github.com/sitmun/sitmun-admin-app) for a complete geospatial platform.

## Features

### Core Mapping Features

- Interactive mapping using SITNA (Sistema de Información Territorial de Navarra)
- Geolocation services
- Search and query (feature info, WFS data access)
- Layer visualization with styling and transparency
- Measurement tools (distance, area, draw/markup)
- Map export and print
- Street View integration

### Technical Features

- Responsive UI with Angular Material 16
- Internationalization (CA, ES, EN, FR)
- Configurable UI components
- Lazy loading and efficient rendering
- SITNA integration (api-sitna 4.8.0)
- Service Worker for API auth token forwarding

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

The application will connect to a backend at `https://your-backend.example.com` by default.

## Installation

### Development Installation

1. **Clone the Repository**

```bash
git clone https://github.com/sitmun/sitmun-application-stack.git
cd sitmun-application-stack/front/viewer/sitmun-viewer-app
```

1. **Install Dependencies**

```bash
# Install all dependencies (recommended for CI/CD)
npm ci

# Or install with package-lock.json update
npm install
```

1. **Verify Installation**

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

Builds require the legacy OpenSSL provider because api-sitna bundles libraries that depend on legacy OpenSSL APIs. The `build` script sets `NODE_OPTIONS=--openssl-legacy-provider --max-old-space-size=8192` automatically.

### Environment Configuration

The application supports three build configurations:

| Configuration | Use Case | API URL | Source Maps | Production |
|---------------|----------|---------|-------------|------------|
| **development** | Local `ng serve` | `http://localhost:9000/backend` | Yes | false |
| **docker-dev** | Docker debugging | Template-based (`${PUBLIC_BASE_PATH}backend`) | Yes | false |
| **production** | Docker production | Template-based (`${PUBLIC_BASE_PATH}backend`) | No | true |

#### Environment Files

```
src/environments/
├── environment.ts        # Local development (default)
└── environment.prod.ts   # Production/Docker builds
```

The `docker-dev` and `production` configurations both use `environment.prod.ts`, which is generated from `environment.prod.ts.template` during Docker builds via `envsubst`.

### Environment Variables

Configure the following variables in your environment files:

```typescript
export const environment = {
  hashLocationStrategy: boolean, // Enable hash-based routing
  hideBackgroundImage: false, // Hide or not the background image in the login section
  hideDNIEAccess: false, // Hide or not the DNIE Button Access in the login section
  apiUrl: string // Backend API base URL
};
```

### Build Configuration

Build for specific configurations:

```bash
# Local development (uses environment.ts)
npm start
# Or explicitly:
npm run build -- --configuration=development

# Docker debugging (uses environment.prod.ts, with source maps)
npm run build -- --configuration=docker-dev

# Production build (uses environment.prod.ts, optimized)
npm run build -- --configuration=production

# Production build with custom base href
npm run build -- --configuration=production --base-href=/viewer/
```

For Docker builds, use the parent stack's docker-compose:

```bash
# Production Docker build (default)
docker compose build front

# Docker build with source maps for debugging
BUILD_MODE=docker-dev docker compose build front
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
# Start development server (uses environment.ts)
npm start

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

# Clean build artifacts
npm run clean

# Clean build artifacts (non-interactive)
npm run clean:force

# Clean only build artifacts (keep node_modules)
npm run clean:build
```

## Testing

The viewer application uses **Jest** as the test runner, aligned with the admin application configuration. Tests are configured to run in a jsdom environment with Angular testing utilities.

### Test Configuration

- **Test Runner**: Jest (via `@angular-builders/jest`)
- **Test Framework**: Jest with `jest-preset-angular`
- **Environment**: jsdom (browser-like environment)
- **Coverage**: v8 provider
- **Configuration**: `jest.config.ts`

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- path/to/file.spec.ts
```

### Test Setup

The test environment is configured in `setup-jest.ts`, which includes:

- Angular TestBed initialization
- Global mocks for localStorage, sessionStorage, matchMedia
- IntersectionObserver mock
- WebGL/Canvas mocks for api-sitna library
- SITNA_BASE_URL configuration

### Path Aliases

Tests use the same TypeScript path aliases as the application:

- `@auth/*` → `src/app/auth/*`
- `@config/*` → `src/app/config/*`
- `@api/*` → `src/app/api/*`
- `@sections/*` → `src/app/sections/*`
- `@shared/*` → `src/app/shared/*`
- `@ui/*` → `src/app/ui/*`

These are automatically resolved by Jest's `moduleNameMapper` configuration.

### Testing Gaps

Planned coverage additions (from 1.2.0-rc.1):

- Services: catalog-switching, error-tracking, global-error-handler, layer-info, map-interface, map-service-worker, raster-layer, sidebar-manager
- Components: about-dialog, error-details-sidebar

## Deployment

### Default paths (local development)

- `src/index.html` uses root-based paths:
  - `<base href="/">`
  - `window.SITNA_BASE_URL = '/assets/js/api-sitna/'`
  - `ServiceWorker` registered with `scope: '/'`
- `webpack.config.js` defines `SITNA_BASE_URL` as `'/assets/js/api-sitna'` via `DefinePlugin`.
- Works when the app is served at `/` (e.g., `http://localhost:4200/`).

### Deploying under a sub-path (BASE_PATH/)

When serving the app at `https://host/BASE_PATH/`, update all of the following to use `BASE_PATH/` explicitly:

1) Angular build base href

```bash
ng build --configuration=production --base-href=/BASE_PATH/
```

1) HTML base href (src/index.html)

```html
<base href="/BASE_PATH/">
```

1) SITNA base URL (runtime, in src/index.html)

```html
<script>
  window.SITNA_BASE_URL = '/BASE_PATH/assets/js/api-sitna/';
</script>
```

1) Service Worker scope (src/index.html)

```js
navigator.serviceWorker.register('ServiceWorker.js', { scope: '/BASE_PATH/' })
```

1) Runtime asset loads (src/index.html)

- Patch loader script:

```js
script.src = '/BASE_PATH/assets/js/patch/patch_main.js';
```

- Toastr assets:

```html
<!-- Toastr CSS is included via angular.json "styles" -->
<script src="/BASE_PATH/assets/js/toastr/toastr.min.js"></script>
```

1) SITNA base URL (compile-time, webpack.config.js)

```js
const apiSitnaDestiny = '/BASE_PATH/assets/js/api-sitna';
new webpack.DefinePlugin({ SITNA_BASE_URL: JSON.stringify(apiSitnaDestiny) })
```

1) Web server routing

- Serve the built app under `/BASE_PATH/` in your web server (e.g., Nginx location block).

Notes & pitfalls:

- All of the above must agree: `<base href>`, runtime `SITNA_BASE_URL`, ServiceWorker `scope`, webpack `DefinePlugin` value, and the CLI `--base-href`.
- If you see JSON parsing errors like `Unexpected token '<'`, paths likely point to HTML (e.g., index.html). Re-check the base path.

### Deployment Scripts

The project includes deployment scripts in the `scripts/` directory:

```bash
# Deploy to GitHub Pages (requires GITHUB_API_KEY and USERNAME env vars)
./scripts/deploy.sh

# For local testing, copy scripts/env.example to scripts/.env and configure
cp scripts/env.example scripts/.env
# Edit scripts/.env with your credentials
```

The deployment script:

- Validates build artifacts exist
- Clones the GitHub Pages repository
- Copies build artifacts
- Commits and pushes changes with deployment metadata
- Handles credentials securely

## API Integration

### Backend Integration

The application integrates with the [SITMUN Backend Core](https://github.com/sitmun/sitmun-backend-core) REST API:

#### Authentication Endpoints

```http
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

The application uses the **SITNA (Sistema de Información Territorial de Navarra) library** for advanced mapping capabilities:

**Version Information:**

- **SITNA API Version**: Aligned with api-sitna 4.8.0

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

#### **Supported Controls**

Controls are registered in `src/app/controls/handlers` and configured via backend tasks plus `src/assets/config/app-config.json` (`controlDefaults`, `enabledByDefault`, `disabledControls`). Parameters are merged with defaults where applicable.

| Control Identifier | Purpose | Patches | Key Config / Notes |
| --- | --- | --- | --- |
| `sitna.attribution` | Attribution control | No | Map attribution toggle; optional `div`. Auto-enabled when `attribution` text exists. |
| `sitna.basemapSelector` | Base map selection | No | Selector for background maps; `div` default `tc-slot-bms`. |
| `sitna.click` | Click handling | No | Enables click interaction; supports `active` and `callback` in SITNA. |
| `sitna.coordinates` | Coordinates display | No | Shows map coords (optionally geographic); `div` default `tc-slot-coordinates`. |
| `sitna.dataLoader` | External data loading | No | Add WMS services and local files; `div` fixed `tc-slot-xdata`; `wmsSuggestions`, `enableDragAndDrop`. |
| `sitna.download` | Map/data download | No | Download map image or vector data; `div` default `tc-slot-download`; `deselectableTabs`. |
| `sitna.drawMeasureModify` | Draw/measure/modify | Yes | Drawing + measure control; `div` default `tc-slot-drawmeasuremodify`; `displayElevation`, `snapping`. |
| `sitna.featureInfo` | GetFeatureInfo | Yes | WMS feature info by click; `persistentHighlights`, `displayElevation`. |
| `sitna.fullScreen` | Fullscreen | No | Toggle fullscreen; `div` default `tc-slot-fullscreen`. |
| `sitna.geolocation` | GPS & routes | No | Geolocation and routes; `div` default `tc-slot-geolocation`; `displayElevation`. |
| `sitna.layerCatalog` | Layer catalog (virtual WMS) | Yes | Browse/add WMS layers; `div` default `tc-slot-toc`; `enableSearch`; virtual services from SITMUN trees. |
| `sitna.legend` | Map legend | No | Legend display for layers; `div` default `tc-slot-legend`. |
| `sitna.loadingIndicator` | Loading indicator | No | Global map loading indicator; boolean `true` or options. |
| `sitna.measure` | Measure tool | No | Length/area/perimeter; `div` default `tc-slot-measure`; `displayElevation`. |
| `sitna.multiFeatureInfo` | Spatial feature info | No | Multi-geometry queries (point/line/polygon); `div` default `tc-slot-multifeatureinfo`; `modes`, `persistentHighlights`. |
| `sitna.navBar` | Navigation bar | No | Zoom/navigation bar; `div` default `tc-slot-nav`. |
| `sitna.offlineMapMaker` | Offline map maker | No | Offline map packs; `div` default `tc-slot-offline`; `averageTileSize`, `offlineMapHintDiv`. |
| `sitna.overviewMap` | Overview map | No | Situation map; `div` default `tc-slot-ovmap`; `layer` resolved from `situation-map` or first basemap. |
| `sitna.popup` | Marker popup | No | Popup for marker data; boolean `true` or options. |
| `sitna.printMap` | Print to PDF | Yes | Print control; `div` default `tc-slot-print`; `logo`, `legend`; patched using npm. |
| `sitna.scale` | Scale display | No | Numeric scale indicator; `div` default `tc-slot-scale`. |
| `sitna.scaleBar` | Scale bar | No | Graphic scale indicator; `div` default `tc-slot-scale`. |
| `sitna.scaleSelector` | Scale selector | No | Numeric scale selector; `div` default `tc-slot-scale`. |
| `sitna.search` | Search control | Yes | Search coordinates and entities; `div` default `tc-slot-search`; patched to avoid recursive events. |
| `sitna.share` | Share control | No | Share map state; requires `stateful` map; `div` default `tc-slot-share`. |
| `sitna.streetView` | Street View | No | Google Street View; `div` default `tc-slot-streetview`; `googleMapsKey`, `viewDiv`. |
| `sitna.threed` | 2D/3D toggle | No | Toggle 2D/3D views; boolean `true` (auto-placed); 3D view set in `views.threeD`. |
| `sitna.WFSEdit` | WFS editing | No | Edit WFS features; `div` default `tc-slot-wfsedit`; `downloadElevation`, `highlightChanges`, `showOriginalFeatures`, `snapping`, `styles`. |
| `sitna.WFSQuery` | WFS query | No | Alphanumeric WFS queries from work layers; boolean `true` or `styles`, `highlightStyles`/`highLightStyles`. |
| `sitna.workLayerManager` | Work layers | No | Manage loaded layers, order, visibility; `div` default `tc-slot-wlm`. |

**Enabled by default:** `sitna.loadingIndicator` is listed in `enabledByDefault` in `src/assets/config/app-config.json`. To turn it off globally, remove it from `enabledByDefault` or add it to `disabledControls`.

**Disabled by default:** `sitna.WFSEdit` and `sitna.offlineMapMaker` are listed in `disabledControls` in `src/assets/config/app-config.json`.

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

```text
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
- **SITNA Integration**: Advanced mapping through SITNA library (api-sitna 4.8.0)

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

1. **Submit a pull request** with a clear description

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

### UI Copy Checklist

- Prefer short, concrete sentences and avoid filler words
- Keep labels and placeholders consistent with the same user intent
- Use sentence case for messages and title case for headings

## Support

### Troubleshooting

#### Common Issues

#### Build Errors

- **OpenSSL Errors**: Ensure Node.js 16+ is used, the build script handles legacy provider automatically
- **Memory Issues**: Large SITNA library may require increased Node.js memory limits
- **Dependency Conflicts**: Use `npm ci` for clean installs

#### Runtime Issues

- **Map Not Loading**: Check backend connectivity and API endpoints
- **Authentication Errors**: Verify JWT token validity and backend authentication
- **Responsive Issues**: Test on different screen sizes, check CSS breakpoints

#### Development Issues

- **Hot Reload Not Working**: Check file watching limits on your system
- **Test Failures**: Ensure Jest is properly configured and dependencies are installed
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
