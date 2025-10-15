# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Basemap selector and comparator component with improved UI ([#87](https://github.com/sitmun/sitmun-viewer-app/issues/87)) ([0c5e0b6](https://github.com/sitmun/sitmun-viewer-app/commit/0c5e0b639d0f199175d83429c213e021f4306a45))
- Projection data patch for EPSG coordinate system handling with caching support ([6504b56](https://github.com/sitmun/sitmun-viewer-app/commit/6504b560ff47b1e20bd545b4aedeef1f7f293359))
- API Sitna integrated as npm module dependency ([#86](https://github.com/sitmun/sitmun-viewer-app/issues/86)) ([f2e5444](https://github.com/sitmun/sitmun-viewer-app/commit/f2e5444d0b8225da3553cb38e06bff8f684fee2a))
- Navigation method that accepts both application and territory IDs for explicit routing ([57a985e](https://github.com/sitmun/sitmun-viewer-app/commit/57a985e9a66152c16eb3259559eddcf4745f7b99))
- Territory count label displayed on application presentation page ([5e567db](https://github.com/sitmun/sitmun-viewer-app/commit/5e567db6e87b0a7eff65d5272f1dab7618fb3a31))
- Animation modules (BrowserAnimation and MatExpansion) for enhanced user interface ([4e60c3b](https://github.com/sitmun/sitmun-viewer-app/commit/4e60c3b0ff2da584b8a21425f9110457802c5270))
- Description max length truncation pipe for managing long text in cards ([4e60c3b](https://github.com/sitmun/sitmun-viewer-app/commit/4e60c3b0ff2da584b8a21425f9110457802c5270))

### Changed
- SITNA API upgraded to version 4.1.0 with comprehensive asset updates ([#86](https://github.com/sitmun/sitmun-viewer-app/issues/86)) ([75caae5](https://github.com/sitmun/sitmun-viewer-app/commit/75caae59ada27e84191dc5ef64e2a237ce80cfd9))
- SITNA API version along with CRS projection data files ([d64180e](https://github.com/sitmun/sitmun-viewer-app/commit/d64180e77b0e200751ca52ddaa7450bf3fd14406))
- API-SITNA assets override updated with latest patches ([f8fc1ad](https://github.com/sitmun/sitmun-viewer-app/commit/f8fc1ad6671dccae31a6ac45a227a0cc85130e4e))
- Password reset flow consolidated and improved for better security ([dd571ec](https://github.com/sitmun/sitmun-viewer-app/commit/dd571ece4ec8f9cd42e21d0cfdbcf29f6db46052))
- Application presentation page now displays territory counts with orange hover effects ([5e567db](https://github.com/sitmun/sitmun-viewer-app/commit/5e567db6e87b0a7eff65d5272f1dab7618fb3a31))
- Territory section background changed to white for cleaner appearance ([8ecece9](https://github.com/sitmun/sitmun-viewer-app/commit/8ecece988e285e1850bae2fdec53c1d6b2ef6232))
- Dashboard card layout and visual design improvements ([0aee5b9](https://github.com/sitmun/sitmun-viewer-app/commit/0aee5b9b6556fb3c68d3975bf53aaa35758d10ee))
- Header navigation bar enhanced with improved menu component and language selection ([a59d0a9](https://github.com/sitmun/sitmun-viewer-app/commit/a59d0a996316e28dcd03417d780e761814f32ebd))
- Territories list component accent color changed to orange ([7a3ac51](https://github.com/sitmun/sitmun-viewer-app/commit/7a3ac51acc17e4e0ded1c689b51f44b68405f3c1))
- Card content on mobile view now uses expansion panels with text truncation ([4e60c3b](https://github.com/sitmun/sitmun-viewer-app/commit/4e60c3b0ff2da584b8a21425f9110457802c5270))
- Profile update security improved by verifying user credentials directly in update function ([71f53a3](https://github.com/sitmun/sitmun-viewer-app/commit/71f53a3228bafe7b41f9eadb7a89f9c485bb9978))
- Dashboard filtering changed to use appPrivate field instead of public field ([3da818e](https://github.com/sitmun/sitmun-viewer-app/commit/3da818ee376e7df265527dfb7534b39aa60093b7))
- User account and territory position update requests changed from PUT to POST method ([1d879fe](https://github.com/sitmun/sitmun-viewer-app/commit/1d879fe7ee6832675fa7c382791b318b9904965f))

### Fixed
- Template type errors in dashboard item and menu components ([1d3b4cb](https://github.com/sitmun/sitmun-viewer-app/commit/1d3b4cb05b3ca0e4bdb56c2d850fb7883639d1dd))
- Navigation redirection issues in dashboard item component ([61ff4a9](https://github.com/sitmun/sitmun-viewer-app/commit/61ff4a9054a6a2c4b9ebe94b8062043ff5cbb9a5), [fe60899](https://github.com/sitmun/sitmun-viewer-app/commit/fe60899212309a774495d365d78b2f41de8af957))
- Missing nav-home selector in DrawMeasureModify component ([3d2e9c2](https://github.com/sitmun/sitmun-viewer-app/commit/3d2e9c2bf56f109dea0f7f6978845a349f1808a2))
- EPSG.io broken endpoint with workaround patches ([15d1915](https://github.com/sitmun/sitmun-viewer-app/commit/15d1915661ca47078afd38bd67afa02f1f3790bb))
- Global TC object accessibility in patch files ([85b5b53](https://github.com/sitmun/sitmun-viewer-app/commit/85b5b5395424d7c9050003e779cd61a0b78dc036))
- Invalid template syntax by removing this and .content references ([57a985e](https://github.com/sitmun/sitmun-viewer-app/commit/57a985e9a66152c16eb3259559eddcf4745f7b99))

### Removed
- Unused library dependencies in basemap control ([#87](https://github.com/sitmun/sitmun-viewer-app/issues/87)) ([6bf9f62](https://github.com/sitmun/sitmun-viewer-app/commit/6bf9f62259a64a9e88d1529c216433082533aa90))
- Reset password component in favor of consolidated forgot password flow ([dd571ec](https://github.com/sitmun/sitmun-viewer-app/commit/dd571ece4ec8f9cd42e21d0cfdbcf29f6db46052))

## [1.1.1] - 2025-08-28

### Added
- New territories list component for better territory management
- Enhanced navigation bar with app/territory switching functionality
- New UI icons for improved user interface (change, check, menu, dropdown)
- Map section navigation controls with show/hide navbar functionality
- Additional internationalization strings for new features
- GitHub workflow for managing stale issues and pull requests

### Changed
- Enhanced navigation bar component with improved functionality
- Updated secondary button component styling and behavior
- Improved notification component styling
- Enhanced map styles with updated CSS configurations

### Fixed
- Fixed navbar not updating on in-app navigation
- Resolved navbar override issues on page refresh
- Fixed ChangeAppTerritory button visibility logic (now shows when there's one app and one territory)

## [1.1.0] - 2025-08-17

### Added
- Node.js version specification (.nvmrc) for v16
- Comprehensive documentation improvements in README.md
- Engine requirements specification in package.json (Node >=16.0.0, npm >=8.0.0)
- Enhanced notification system with dedicated service and component
- Additional Angular Material UI components (autocomplete, form-field, input, icon)
- New UI components for application details, territory details, and profile information

### Changed
- Upgraded Angular from v16.0.0 to v16.2.12 for improved performance and modern features
- Updated TypeScript from v4.9.5 to v5.1.6 for enhanced type safety
- Updated Angular Material from v15.2.3 to v16.2.12 for consistent UI components
- Updated ngx-translate packages (core: v14.0.0→v15.0.0, http-loader: v7.0.0→v8.0.0) for better internationalization
- Updated ESLint and related development dependencies for improved code quality
- Modernized project structure and configuration with improved component organization
- Enhanced module imports in app.module.ts and ui.module.ts
- Updated tsconfig.json and angular.json configurations for better build optimization
- Restructured UI components with better folder organization

### Fixed
- Resolved dependency conflicts and compatibility issues
- Fixed build configuration problems
- Corrected module import issues

### Removed
- Removed Docker and nginx configuration files
- Removed unused dependencies (fflate, hammerjs, igniteui-angular)
- Cleaned up obsolete configuration files

## [1.0.0] - 2024-11-12

### Added
- Initial stable release of SITMUN Viewer Application
- Interactive web mapping interface using SITNA library
- Comprehensive geospatial data visualization capabilities
- Multi-language support (Catalan, English, Spanish, French)
- Responsive design with mobile-first approach
- Authentication and authorization system
- User dashboard with application and territory management
- Public map viewer for unauthenticated users
- Embedded map viewer for external integration
- Advanced search and query functionality
- Layer management with styling and transparency controls
- Measurement tools (distance, area, drawing)
- Print and export capabilities
- Geolocation services with GPS positioning
- Street View integration with Google Maps
- Base map selection with multiple options
- Feature information display on map clicks
- Work layer manager for user-added layers
- Coordinate display with multiple coordinate systems
- Scale controls and overview map
- REST API integration with SITMUN Backend Core
- JWT token-based authentication
- Route protection with authentication guards
- HTTP interceptors for automatic token handling
- Error handling with user-friendly messages
- Loading indicators and progress feedback
- Toastr notification system
- Angular Material UI components
- Comprehensive test suite with Karma and Jasmine
- Build system with environment-specific configurations
- Docker support for development environment

### Changed
- Implemented proper dependency management
- Enhanced code quality and maintainability
- Optimized performance with lazy loading
- Improved security with proper token management
- Enhanced user experience with intuitive interface design

### Fixed
- Various bug fixes and improvements from development phase
- Map rendering issues on different browsers
- Authentication flow problems
- Responsive design issues
- API integration errors
- Performance optimization issues

[unreleased]: https://github.com/sitmun/sitmun-application-stack/compare/sitmun-viewer-app/1.1.1...HEAD
[1.1.1]: https://github.com/sitmun/sitmun-application-stack/compare/sitmun-viewer-app/1.1.0...sitmun-viewer-app/1.1.1
[1.1.0]: https://github.com/sitmun/sitmun-application-stack/compare/sitmun-viewer-app/1.0.0...sitmun-viewer-app/1.1.0
[1.0.0]: https://github.com/sitmun/sitmun-application-stack/releases/tag/sitmun-viewer-app/1.0.0
