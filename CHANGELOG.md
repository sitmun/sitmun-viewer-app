# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Future enhancements and improvements planned for upcoming releases

### Changed
- Planned updates and modifications

### Fixed
- Planned bug fixes and issue resolutions

### Removed
- Planned cleanup and removal of deprecated features

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

[unreleased]: https://github.com/sitmun/sitmun-application-stack/compare/sitmun-viewer-app/1.1.0...HEAD
[1.1.0]: https://github.com/sitmun/sitmun-application-stack/compare/sitmun-viewer-app/1.0.0...sitmun-viewer-app/1.1.0
[1.0.0]: https://github.com/sitmun/sitmun-application-stack/releases/tag/sitmun-viewer-app/1.0.0
