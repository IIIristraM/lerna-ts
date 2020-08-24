import ts from 'typescript';

import transform from '../index';

const printer = ts.createPrinter();

test('transform', () => {
    const sourceFile = ts.createSourceFile(
        'test.ts',
        `
            import { load } from '@project/tools/code-splitting/load'
            const XXX = load(() => import('@project/common/components/xxx'))
            const YYY = load(() => import('./yyy'))
        `,
        ts.ScriptTarget.Latest,
    );

    const expectSourceFile = ts.createSourceFile(
        'test.ts',
        `
            import { load } from '@project/tools/code-splitting/load';
            const XXX = load({
                chunkName: () => '__project_common_components_xxx',
                asyncImport: () => import(/* webpackChunkName: "__project_common_components_xxx" */ '@project/common/components/xxx'),
                syncImport: () => {
                    return __webpack_require__(require.resolveWeak('@project/common/components/xxx'));
                }
            });
            const YYY = load({
                chunkName: () => '__yyy',
                asyncImport: () => import(/* webpackChunkName: "__yyy" */ './yyy'),
                syncImport: () => {
                    return __webpack_require__(require.resolveWeak('./yyy'));
                }
            });
        `,
        ts.ScriptTarget.Latest,
    );

    const transformedFile = ts.transform(sourceFile, [transform]).transformed[0];
    expect(printer.printFile(transformedFile)).toBe(printer.printFile(expectSourceFile));
});
