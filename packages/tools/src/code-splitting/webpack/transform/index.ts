import ts, { TransformerFactory } from 'typescript';
import { hasLoadUsage, isLoadFn, createLoadOptions, isFnImport, isObjectImport, isImportProp } from './utils';

export const transform: TransformerFactory<ts.SourceFile> = context => {
    let sourceFile: ts.SourceFile;

    const processArgs = (arg: ts.Expression) => {
        let importedModule = '';
        let chunkName = '';

        const visitor = (node: ts.Node): ts.Node => {
            const call = isFnImport(node) || isObjectImport(node);
            if (call) {
                importedModule = (call.arguments[0] as ts.StringLiteral).text;
                const fullText = call.arguments[0].getFullText(sourceFile);
                chunkName = fullText.match(/webpackChunkName:\s+"([^"]+)"/)?.[1] || chunkName;

                return node;
            }

            return ts.visitEachChild(node, visitor, context);
        };

        ts.visitEachChild(arg, visitor, context);

        return importedModule
            ? ts.createNodeArray([
                  createLoadOptions(
                      importedModule,
                      chunkName,
                      ts.isObjectLiteralExpression(arg) ? arg.properties.filter(p => !isImportProp(p)) : [],
                  ),
              ])
            : [arg];
    };

    const visitor = (loadFnName?: string) => (node: ts.Node): ts.Node => {
        if (ts.isSourceFile(node)) {
            sourceFile = node;
            const importName = hasLoadUsage(node);
            if (!importName) return node;

            return ts.visitEachChild(node, visitor(importName), context);
        }

        if (!loadFnName) {
            throw new Error('loadFnName is not defined');
        }

        const args = isLoadFn(loadFnName, node);
        if (!args) {
            return ts.visitEachChild(node, visitor(loadFnName), context);
        }

        if (
            !ts.isArrowFunction(args[0]) &&
            !ts.isFunctionExpression(args[0]) &&
            !ts.isObjectLiteralExpression(args[0])
        ) {
            return node;
        }

        return ts.createCall(ts.createIdentifier(loadFnName), undefined, processArgs(args[0]));
    };

    return node => {
        return ts.visitNode(node, visitor());
    };
};
