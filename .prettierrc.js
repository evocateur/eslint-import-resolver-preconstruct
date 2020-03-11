'use strict';

module.exports = {
    endOfLine: 'lf',
    printWidth: 100,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'es5',
    quoteProps: 'consistent',

    overrides: [
        // explicitly keep output consistent with npm
        {
            files: [
                '.eslintrc.json',
                'lerna.json',
                'package.json',
                'package-lock.json',
                'npm-shrinkwrap.json',
            ],
            options: {
                parser: 'json-stringify',
                tabWidth: 2,
                trailingComma: 'none',
            },
        },
        {
            files: ['*.yaml', '*.yml'],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
