import ts from 'typescript';

import { hasLoadUsage, isLoadFn } from '../utils';

test('hasLoadUsage_1', () => {
    let sourceFile = ts.createSourceFile(
        'test.ts',
        `
            import {load} from '@project/tools/code-splitting/load'
        `,
        ts.ScriptTarget.Latest,
    );

    expect(hasLoadUsage(sourceFile)).toBe('load');
});

test('hasLoadUsage_2', () => {
    const sourceFile = ts.createSourceFile(
        'test.ts',
        `
            import {load as xxx} from '@project/tools/code-splitting/load'
        `,
        ts.ScriptTarget.Latest,
    );

    expect(hasLoadUsage(sourceFile)).toBe('xxx');
});

test('hasLoadUsage_3', () => {
    const sourceFile = ts.createSourceFile(
        'test.ts',
        `
            import '@project/tools/code-splitting/load'
        `,
        ts.ScriptTarget.Latest,
    );

    expect(hasLoadUsage(sourceFile)).toBe(false);
});

test('hasLoadUsage_4', () => {
    const sourceFile = ts.createSourceFile(
        'test.ts',
        `
            import {xxx} from '@project/tools/code-splitting/load'
        `,
        ts.ScriptTarget.Latest,
    );

    expect(hasLoadUsage(sourceFile)).toBe(false);
});

test('isLoadFn', () => {
    expect(
        isLoadFn('load', ts.factory.createCallExpression(ts.factory.createIdentifier('load'), undefined, [])),
    ).toBeTruthy();

    expect(isLoadFn('xxx', ts.factory.createCallExpression(ts.factory.createIdentifier('load'), undefined, []))).toBe(
        null,
    );
});
