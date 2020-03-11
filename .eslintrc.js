'use strict';

module.exports = {
    extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:prettier/recommended'],
    plugins: ['node', 'prettier'],
    parserOptions: {
        ecmaVersion: 2018,
    },
    root: true,
    rules: {
        'prettier/prettier': 'error',
    },
};
