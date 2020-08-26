const path = require('path');

module.exports = context => ({
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
        'ts-jest': {
            isolatedModules: true,
            tsConfig: path.resolve(context, './tsconfig.json'),
        },
    },
});
