import React from 'react';
import { renderToString } from 'react-dom/server';

import { createLoadComponent } from '@project/tools/code-splitting/load';
import { ChunksManager } from '@project/tools/code-splitting/server';

function App({ children }: { children?: React.ReactNode; }) {
    return <>{children}</>;
}

// const originError = console.error;

async function nodeRender(renderApp: () => JSX.Element) {
    const chunksManager = new ChunksManager();

    renderToString(
        chunksManager.wrap(renderApp()),
    );

    return { chunks: chunksManager.chunksToLoad };
}

afterEach(() => {
    jest.clearAllMocks();
});

// jest.resetModuleRegistry makes hooks to throw error so jest.isolateModules
function isolate(fn: () => Promise<unknown>) {
    return new Promise<void>((resolve, reject) => {
        jest.isolateModules(async () => {
            try {
                await fn();
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
}

test('collect chunks', async () => {
    return isolate(async () => {
        const HeaderAsync = createLoadComponent({
            asyncImport: () => import('./components/Header'),
            chunkName: () => 'Header',
            syncImport: () => require('./components/Header'),
        });

        const ContentAsync = createLoadComponent({
            asyncImport: () => import('./components/Content'),
            chunkName: () => 'Content',
            syncImport: () => require('./components/Content'),
        });

        const renderApp = () => (
            <App>
                <HeaderAsync />
                <ContentAsync />
            </App>
        );

        const { chunks } = await nodeRender(renderApp);
        expect(chunks).toEqual(['Header', 'Content']);
    });
});
