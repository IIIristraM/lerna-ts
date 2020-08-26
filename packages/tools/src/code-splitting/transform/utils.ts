import ts, { SourceFile } from 'typescript';

export function hasLoadUsage(source: SourceFile) {
    for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement)) {
            // all imports checked
            return false;
        }

        if (!ts.isStringLiteral(statement.moduleSpecifier)) {
            continue;
        }

        if (
            statement.moduleSpecifier.text.includes('code-splitting/load') &&
            statement.importClause?.namedBindings &&
            ts.isNamedImports(statement.importClause?.namedBindings)
        ) {
            const loadImport = statement.importClause?.namedBindings.elements.find(
                el => (el.propertyName || el.name).text === 'load',
            );
            if (!loadImport) {
                return false;
            }

            return loadImport.name.text;
        }
    }

    return false;
}

export function isLoadFn(loadFnName: string, node: ts.Node) {
    if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression) || node.expression.text !== loadFnName) {
        return null;
    }

    return node.arguments;
}

function createChunkName(chunkName: string) {
    return ts.createPropertyAssignment(
        ts.createIdentifier('chunkName'),
        ts.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.createStringLiteral(chunkName),
        ),
    );
}

function createAsyncImport(modulePath: string, chunkName: string) {
    const importNode = ts.createToken(ts.SyntaxKind.ImportKeyword) as ts.Expression;

    const importPathNode = ts.createStringLiteral(modulePath);
    ts.addSyntheticLeadingComment(
        importPathNode,
        ts.SyntaxKind.MultiLineCommentTrivia,
        ` webpackChunkName: "${chunkName}" `,
    );

    return ts.createPropertyAssignment(
        ts.createIdentifier('asyncImport'),
        ts.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.createCall(importNode, undefined, [importPathNode]),
        ),
    );
}

function createSyncImport(modulePath: string) {
    return ts.createPropertyAssignment(
        ts.createIdentifier('syncImport'),
        ts.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.createBlock(
                [
                    ts.createReturn(
                        ts.createCall(ts.createIdentifier('__webpack_require__'), undefined, [
                            ts.createCall(
                                ts.createPropertyAccess(
                                    ts.createIdentifier('require'),
                                    ts.createIdentifier('resolveWeak'),
                                ),
                                undefined,
                                [ts.createStringLiteral(modulePath)],
                            ),
                        ]),
                    ),
                ],
                true,
            ),
        ),
    );
}

export function isFnImport(node: ts.Node) {
    if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        ts.isStringLiteral(node.arguments[0])
    ) {
        return node;
    }

    return null;
}

export function isImportProp(node: ts.ObjectLiteralElementLike) {
    return node.name && (ts.isStringLiteral(node.name) || ts.isIdentifier(node.name)) && node.name.text === 'import';
}

export function isObjectImport(node: ts.Node) {
    if (!ts.isObjectLiteralExpression(node)) {
        return null;
    }

    const importProperty = node.properties.find(isImportProp);

    if (!importProperty || !ts.isPropertyAssignment(importProperty)) {
        return null;
    }

    return isFnImport(importProperty.initializer);
}

export function createLoadOptions(
    modulePath: string,
    chunkCustomName: string,
    publicProps: Array<ts.ObjectLiteralElementLike> = [],
) {
    const chunkName =
        chunkCustomName ||
        modulePath
            .replace(/@/g, '')
            .split('/')
            .filter(s => !s.match(/^[.]*$/))
            .join('_');

    return ts.createObjectLiteral(
        [
            createChunkName(chunkName),
            createAsyncImport(modulePath, chunkName),
            createSyncImport(modulePath),
            ...publicProps,
        ],
        true,
    );
}
