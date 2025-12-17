# Dashboard Configuration

This directory contains runtime configuration for the SITMUN Viewer application. Changes to these files take effect immediately without requiring a rebuild of the application.

## Configuration Files

### `app-config.json`

Main configuration file for the application.

## Dashboard Type Filtering

The dashboard can filter items based on their `type` property. This is useful when different deployments need to show different types of applications.

### Configuration Fields

#### `dashboard.allowedTypes`

**Type**: `string[]`  
**Default**: `["I"]`

Array of type codes that will be displayed in the dashboard. Only items with a type matching one of these codes will be shown.

- Items with `null` or `undefined` type will be filtered out when filtering is enabled
- Empty array `[]` combined with `filteringEnabled: false` will show all items

#### `dashboard.filteringEnabled`

**Type**: `boolean`  
**Default**: `true`

Enables or disables type-based filtering. When `false`, all items are shown regardless of their type.

### Type Values Reference

The `type` property values are defined in the backend database. Known types include:

- **`"I"`**: Internal applications - Applications intended for internal organizational use

**Note**: Other type values may exist in your specific deployment. To discover available types:

1. Check the backend API response for the applications endpoint
2. Query the database directly for the `type` field values
3. Contact your system administrator for deployment-specific type codes

### Configuration Examples

#### Show Only Internal Applications (Default)

```json
{
  "dashboard": {
    "allowedTypes": ["I"],
    "filteringEnabled": true
  }
}
```

#### Show Multiple Types

```json
{
  "dashboard": {
    "allowedTypes": ["I", "E", "P"],
    "filteringEnabled": true
  }
}
```

#### Disable Filtering (Show All Items)

```json
{
  "dashboard": {
    "allowedTypes": [],
    "filteringEnabled": false
  }
}
```

## Deployment Instructions

### How to Apply Configuration Changes

1. **Locate the configuration file** in your deployed application:
   ```
   /path/to/deployed/app/assets/config/app-config.json
   ```

2. **Edit the file** with your desired configuration:
   ```bash
   # Example using a text editor
   nano /path/to/deployed/app/assets/config/app-config.json
   ```

3. **Save the changes**

4. **Refresh the application** in your browser (no server restart or rebuild required)
   - Hard refresh: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear browser cache if changes don't appear

### Deployment-Specific Configurations

For different environments, you can maintain separate configuration files and copy the appropriate one during deployment:

```bash
# Development
cp app-config.development.json app-config.json

# Production
cp app-config.production.json app-config.json
```

### Docker Deployments

For Docker deployments, mount the config file as a volume or copy it during container initialization:

```dockerfile
# Example Dockerfile snippet
COPY config/app-config.production.json /app/assets/config/app-config.json
```

Or using docker-compose:

```yaml
volumes:
  - ./config/app-config.json:/app/assets/config/app-config.json
```

## Troubleshooting

### Configuration Not Loading

If configuration changes don't take effect:

1. **Check browser cache**: Perform a hard refresh (Ctrl+F5 or Cmd+Shift+R)
2. **Verify file path**: Ensure the file is at `/assets/config/app-config.json` relative to the application root
3. **Check JSON syntax**: Invalid JSON will cause the config to fail loading. Use a JSON validator to check syntax
4. **Check browser console**: Open developer tools (F12) and check for errors

### Fallback Behavior

If the configuration file fails to load or is invalid, the application will:
- Log a warning to the browser console
- Fall back to showing all items (filtering disabled)
- Continue to function normally

### Common Mistakes

- **Invalid JSON**: Missing commas, quotes, or brackets will cause the entire config to fail
- **Wrong file location**: The file must be in `assets/config/` directory
- **Case sensitivity**: Field names are case-sensitive (`allowedTypes` not `allowedtypes`)

## Support

For questions or issues with configuration:
1. Check the browser console for error messages
2. Verify the backend is returning the correct type values
3. Contact your system administrator or development team

## Version History

- **v1.0**: Initial dashboard type filtering configuration
