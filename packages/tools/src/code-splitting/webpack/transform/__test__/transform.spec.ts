import ts from 'typescript';

import transform from '../index';

const printer = ts.createPrinter();

test('transform', () => {
    const sourceFile = ts.createSourceFile(
        'test.ts',
        `
            import { load } from '@project/tools/code-splitting/load'
            const XXX = load(() => import('@project/common/components/xxx'))
            const YYY = load(() => import('../../yyy'))
            const ZZZ = load(() => import(/* webpackChunkName: "MyChunkName" */'zzz'))
            const AAA = load({
                import: () => import(/* webpackChunkName: "MyChunkName" */'aaa'),
                Loader: LoaderComponent
            })
        `,
        ts.ScriptTarget.Latest,
    );

    const expectSourceFile = ts.createSourceFile(
        'test.ts',
        `
            import { load } from '@project/tools/code-splitting/load';
            const XXX = load({
                chunkName: () => 'project_common_components_xxx',
                asyncImport: () => import(/* webpackChunkName: "project_common_components_xxx" */ '@project/common/components/xxx'),
                syncImport: () => {
                    return __webpack_require__(require.resolveWeak('@project/common/components/xxx'));
                }
            });
            const YYY = load({
                chunkName: () => 'yyy',
                asyncImport: () => import(/* webpackChunkName: "yyy" */ '../../yyy'),
                syncImport: () => {
                    return __webpack_require__(require.resolveWeak('../../yyy'));
                }
            });
            const ZZZ = load({
                chunkName: () => 'MyChunkName',
                asyncImport: () => import(/* webpackChunkName: "MyChunkName" */ 'zzz'),
                syncImport: () => {
                    return __webpack_require__(require.resolveWeak('zzz'));
                }
            });
            const AAA = load({
                chunkName: () => 'MyChunkName',
                asyncImport: () => import(/* webpackChunkName: "MyChunkName" */ 'aaa'),
                syncImport: () => {
                    return __webpack_require__(require.resolveWeak('aaa'));
                },
                Loader: LoaderComponent
            });
        `,
        ts.ScriptTarget.Latest,
    );

    const transformedFile = ts.transform(sourceFile, [transform]).transformed[0];
    expect(printer.printFile(transformedFile)).toBe(printer.printFile(expectSourceFile));
});
