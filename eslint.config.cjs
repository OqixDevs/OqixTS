const { defineConfig, globalIgnores } = require('eslint/config');

const tsParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const { includeIgnoreFile } = require('@eslint/compat');

const path = require('node:path');
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});
const gitignorePath = path.resolve(__dirname, '.gitignore');

module.exports = defineConfig([
    globalIgnores(['eslint.config.cjs']),
    includeIgnoreFile(gitignorePath),
    {
        extends: compat.extends(
            'eslint:recommended',
            'plugin:@typescript-eslint/eslint-recommended',
            'plugin:@typescript-eslint/recommended'
        ),

        languageOptions: {
            parser: tsParser,
        },

        rules: {
            'arrow-spacing': [
                'warn',
                {
                    before: true,
                    after: true,
                },
            ],

            'comma-spacing': 'error',
            'comma-style': 'error',
            curly: ['error', 'multi-line', 'consistent'],
            'dot-location': ['error', 'property'],
            'handle-callback-err': 'off',
            indent: 'off',

            'key-spacing': [
                'error',
                {
                    beforeColon: false,
                    afterColon: true,
                },
            ],

            'jsx-quotes': ['error', 'prefer-single'],
            'keyword-spacing': 'error',
            'no-console': 'off',

            'no-shadow': [
                'error',
                {
                    allow: ['err', 'resolve', 'reject'],
                },
            ],
        },
    },
]);
