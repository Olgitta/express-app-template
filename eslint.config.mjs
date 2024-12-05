import globals from "globals";
import pluginJs from "@eslint/js";

export default {
    files: ["**/*.js"], // Scope to JavaScript files
    languageOptions: {
        sourceType: "commonjs",
        globals: globals.node, // Use Node.js global variables
    },
    ...pluginJs.configs.recommended, // Spread the recommended config
    rules: {
        quotes: ["error", "single"], // Enforce single quotes
        "prefer-const": "error", // Enforce the use of const where possible
    },
};
