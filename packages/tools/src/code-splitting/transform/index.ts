import ts, { TransformerFactory } from 'typescript';
import { hasLoadUsage, isLoadFn, createLoadOptions } from './utils';

const transform: TransformerFactory<ts.SourceFile> = context => {
    const processArgs = (args: ts.NodeArray<ts.Expression>) => {
        let importedModule = '';

        for (const arg of args) {
            const visitor = (node: ts.Node): ts.Node => {
                if (
                    !ts.isCallExpression(node) ||
                    node.expression.kind !== ts.SyntaxKind.ImportKeyword ||
                    !ts.isStringLiteral(node.arguments[0])
                ) {
                    return ts.visitEachChild(node, visitor, context);
                }

                importedModule = (node.arguments[0] as ts.StringLiteral).text;
                return node;
            };

            ts.visitEachChild(arg, visitor, context);
        }

        return importedModule ? ts.createNodeArray([createLoadOptions(importedModule)]) : args;
    };

    const visitor = (loadFnName?: string) => (node: ts.Node): ts.Node => {
        if (ts.isSourceFile(node)) {
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

        if (!ts.isArrowFunction(args[0]) && !ts.isFunctionExpression(args[0])) {
            return node;
        }

        return ts.createCall(ts.createIdentifier(loadFnName), undefined, processArgs(args));
    };

    return node => {
        return ts.visitNode(node, visitor());
    };
};

export default transform;
