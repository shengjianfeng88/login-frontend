module.exports = {
    root: true,
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react-hooks/recommended",
      "plugin:tailwindcss/recommended",
      "prettier",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: [
      "react",
      "@typescript-eslint",
      "react-hooks",
      "tailwindcss",
      "import",
      "unused-imports"
    ],
    rules: {
      "react/prop-types": "off", // Not needed with TypeScript
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "unused-imports/no-unused-imports": "warn",
      "tailwindcss/no-custom-classname": "off", // Set to "warn" if you want to check for non-Tailwind classes
      "import/order": [
        "warn",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          "alphabetize": { "order": "asc", "caseInsensitive": true }
        }
      ],
      "indent": ["error", 2, { "SwitchCase": 1, "ignoredNodes": ["JSXElement"] }],
      "@typescript-eslint/indent": ["error", 2, { "ignoredNodes": ["JSXElement"] }],
      "react/jsx-indent": ["error", 2], // Enforce JSX indentation
      "react/jsx-indent-props": ["error", 2] // Enforce props indentation
    },
    settings: {
      react: {
        version: "detect",
      },
      tailwindcss: {
        callees: ["cn"], // If using clsx or classnames utility
      }
    }
  };
  