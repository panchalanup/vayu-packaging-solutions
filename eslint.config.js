import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Internal links must use <Cta> or router <Link>: a raw <a href="/..."> reloads the whole app and skips analytics (plan §7.6)
      "no-restricted-syntax": [
        "error",
        {
          // String.raw keeps the regex escapes (hex slash) intact; ESQuery cannot take a literal slash inside a regex
          selector: String.raw`JSXOpeningElement[name.name='a'] > JSXAttribute[name.name='href'][value.value=/^\x2F[^\x2F]/]`,
          message: "Use <Cta> or react-router <Link> for internal links instead of <a href=\"/...\">.",
        },
      ],
    },
  },
  {
    // UI primitives and shadcn files may render raw anchors; the rule targets page and feature code
    files: ["src/components/ui/**", "api/**"],
    rules: { "no-restricted-syntax": "off" },
  },
);
