import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import svelteConfig from "./svelte.config.js";

export default [
  {
    ignores: ["app/**", "node_modules/**"],
  },
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        projectService: true,
        extraFileExtensions: [".svelte"],
        svelteConfig,
      },
    },
  },
  {
    rules: {
      "svelte/no-at-html-tags": "error",
      "svelte/require-each-key": "error",
    },
  },
];
