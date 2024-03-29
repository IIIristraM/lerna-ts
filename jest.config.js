const path = require('path');
const { pathsToModuleNameMapper } = require('ts-jest/utils');

module.exports = (context, isolatedModules = false) => {
    const tsconfigPath = path.resolve(context, './tsconfig.json');
    const { compilerOptions } = require(tsconfigPath);
    const moduleNameMapper = compilerOptions.paths
        ? pathsToModuleNameMapper(compilerOptions.paths, { prefix: context })
        : undefined;

    return {
        preset: 'ts-jest',
        testEnvironment: 'node',
        globals: {
            'ts-jest': {
                isolatedModules,
                tsconfig: tsconfigPath,
            },
        },
        moduleNameMapper,
        testPathIgnorePatterns: ['(.*)/dist', '(.*)/build'],
    };
};
