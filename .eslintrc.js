// @ts-check
module.exports = {
    root: true,
    ignorePatterns: [
      "src/**/*.js"
    ],
    overrides: [
      {
        files: [
          "*.ts"
        ],
        extends: [
          "eslint:recommended",
          "plugin:@typescript-eslint/recommended",
          "plugin:@angular-eslint/recommended",
          "plugin:@angular-eslint/template/process-inline-templates",
          "plugin:prettier/recommended"
        ],
        plugins: [
          "import",
          "unused-imports"
        ],
        rules: {
          "@typescript-eslint/no-explicit-any": "off",
          // Disable @typescript-eslint/no-unused-vars in favor of unused-imports plugin
          "@typescript-eslint/no-unused-vars": "off",
          // Unused imports - auto-fixable
          "unused-imports/no-unused-imports": "error",
          // Unused variables - with ignore patterns
          "unused-imports/no-unused-vars": [
            "warn",
            {
              "vars": "all",
              "varsIgnorePattern": "^_",
              "args": "after-used",
              "argsIgnorePattern": "^_"
            }
          ],
          "@angular-eslint/directive-selector": [
            "error",
            {
              "type": "attribute",
              "prefix": "app",
              "style": "camelCase"
            }
          ],
          "@angular-eslint/component-selector": [
            "error",
            {
              "type": "element",
              "prefix": "app",
              "style": "kebab-case"
            }
          ],
          // Disable sort-imports in favor of import/order
          "sort-imports": "off",
          // Main import ordering rule - compatible with IntelliJ IDEA
          "import/order": ["error", {
            "groups": [
              "builtin",      // Node.js builtins
              "external",     // npm packages
              "internal",     // @app/*, @config, @environments/*
              ["parent", "sibling"], // ../ and ./
              "index"         // ./
            ],
            "pathGroups": [
              {
                "pattern": "@angular/**",
                "group": "external",
                "position": "before"  // Angular first among externals
              },
              {
                "pattern": "@app/**",
                "group": "internal"
              },
              {
                "pattern": "@config",
                "group": "internal"
              },
              {
                "pattern": "@environments/**",
                "group": "internal"
              }
            ],
            "pathGroupsExcludedImportTypes": ["builtin"],
            "newlines-between": "always",  // Blank lines between groups
            "alphabetize": {
              "order": "asc",
              "caseInsensitive": true  // Case-insensitive sorting (matches IntelliJ)
            }
          }],
          // Additional helpful rules
          "import/first": "error",              // Imports must come first
          "import/newline-after-import": "error", // Blank line after imports
          "import/no-duplicates": "error"       // Merge duplicate imports
        },
        env: {
          "jasmine": true,
          "browser": true
        }
      },
      {
        files: [
          "*.html"
        ],
        extends: [
          "plugin:@angular-eslint/template/recommended",
          "plugin:@angular-eslint/template/accessibility"
        ],
        rules: {}
      }
    ]
  };
  