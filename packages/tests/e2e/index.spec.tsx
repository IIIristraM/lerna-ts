import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import jsdom from 'jsdom';
import prettier from 'prettier';
import { call, delay } from 'typed-redux-saga';
import createSagaMiddleware from 'redux-saga';

import {
    asyncOperationsReducer,
    getDefaultContext,
    SSRContext,
    SsrContext,
    useOperation,
    ComponentLifecycleService,
    Suspense,
    OperationService,
    useService,
    Root,
    SagaClientHash,
    useDI
} from '@iiiristram/sagun';
import { renderToStringAsync } from '@iiiristram/sagun/server';
import { createLoadComponent } from '@project/tools/code-splitting/load';
import { ChunksManager } from '@project/tools/code-splitting/server';

import { api, DELAY } from './TestAPI';
import Content from './components/Content';
import Table from './components/Table';
import UserInfo from './components/UserInfo';
import { TestService } from './TestService';

type AppStore = {
    asyncOperations: ReturnType<typeof asyncOperationsReducer>;
};

useOperation.setPath((state: AppStore) => state.asyncOperations);

function buildStore(initialState?: AppStore) {
    const sagaMiddleware = createSagaMiddleware();
    const store = applyMiddleware(sagaMiddleware)(createStore)(
        combineReducers({
            asyncOperations: asyncOperationsReducer,
        }),
        initialState,
    );

    return { store, sagaMiddleware };
}

function Layout({ children }: { children?: React.ReactNode }) {
    const context = useDI();
    const service = context.createService(TestService);
    context.registerService(service);
    useService(service);

    return <div>{children}</div>;
}

function App({
    store,
    children,
    context,
    service,
    operationService,
}: {
    store: Store<AppStore>;
    children?: React.ReactNode;
    context: SSRContext;
    service: ComponentLifecycleService;
    operationService: OperationService;
}) {
    return (
        <Root operationService={operationService} componentLifecycleService={service}>
            <SsrContext.Provider value={context}>
                <Provider store={store}>
                    <Layout>{children}</Layout>
                </Provider>
            </SsrContext.Provider>
        </Root>
    );
}

// const originError = console.error;

async function nodeRender(renderApp: ({ context, store }: GetProps<typeof App>) => JSX.Element) {
    const { store, sagaMiddleware } = buildStore();
    const context = getDefaultContext();
    const chunksManager = new ChunksManager();
    const operationService = new OperationService({ hash: {} });
    const service = new ComponentLifecycleService(operationService);

    const task = sagaMiddleware.run(function* () {
        yield* call(service.run);
    });

    const html = await renderToStringAsync(
        chunksManager.wrap(renderApp({ context, store, service, operationService })),
    );

    task.cancel();
    await task.toPromise();

    return { html, hash: operationService.getHash(), store, chunks: chunksManager.chunksToLoad };
}

async function clientRender(
    renderApp: ({ context, store }: GetProps<typeof App>) => JSX.Element,
    html: string,
    state: AppStore,
    hash: SagaClientHash,
    chunks: string[] = [],
) {
    const { store, sagaMiddleware } = buildStore(state);
    const { window } = new jsdom.JSDOM(`
        <html>
            <body>
                <div id="app">${html}</div>
            </body>
        </html>
    `);

    (global as any).window = window;
    (global as any).__CHUNKS_TO_LOAD__ = chunks;
    const operationService = new OperationService({ hash });
    const service = new ComponentLifecycleService(operationService);

    const task = sagaMiddleware.run(function* () {
        yield* call(operationService.run);
        yield* call(service.run);
        yield* delay(DELAY * 10);
        yield* call(service.destroy);
        yield* call(operationService.destroy);
    });

    const appEl = window.document.getElementById('app');
    ReactDOM.hydrate(
        renderApp({
            store,
            service,
            operationService,
            context: getDefaultContext(),
        }),
        appEl,
        () => {
            // handle hydration warnings
            // expect(console.error).toHaveBeenCalledTimes(0);
        },
    );

    await task.toPromise();

    console.log(
        prettier.format(window.document.documentElement.outerHTML, {
            parser: 'html',
            htmlWhitespaceSensitivity: 'ignore',
        }),
    );
}

afterEach(() => {
    (global as any).window = undefined;
    // console.error = originError;
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

test('sync independent sagas', async () => {
    return isolate(async () => {
        const Header = require('./components/Header').default;

        const renderApp = ({ context, store, service, operationService }: GetProps<typeof App>) => (
            <App store={store} context={context} service={service} operationService={operationService}>
                <Header>
                    <UserInfo id="" fallback="" />
                </Header>
                <Content>
                    <Table fallback="" />
                </Content>
            </App>
        );

        const { hash, store, html } = await nodeRender(renderApp);
        expect(api.getUser).toHaveBeenCalledTimes(1);
        expect(api.getList).toHaveBeenCalledTimes(1);

        // console.error = jest.fn(originError);

        await clientRender(renderApp, html, store.getState(), hash);
        expect(api.getUser).toHaveBeenCalledTimes(1);
        expect(api.getList).toHaveBeenCalledTimes(1);
    });
});

test('async independent sagas', async () => {
    return isolate(async () => {
        const HeaderAsync = createLoadComponent({
            asyncImport: () => import('./components/Header'),
            chunkName: () => 'Header',
            syncImport: () => require('./components/Header'),
        });

        const renderApp = ({ context, store, service, operationService }: GetProps<typeof App>) => (
            <App store={store} context={context} service={service} operationService={operationService}>
                <HeaderAsync>
                    <UserInfo id="" fallback="" />
                </HeaderAsync>
                <Content>
                    <Table fallback="" />
                </Content>
            </App>
        );

        const { hash, store, html, chunks } = await nodeRender(renderApp);
        expect(chunks).toEqual(['Header']);
        expect(api.getUser).toHaveBeenCalledTimes(1);
        expect(api.getList).toHaveBeenCalledTimes(1);

        // console.error = jest.fn(originError);

        await clientRender(renderApp, html, store.getState(), hash, chunks);
        expect(api.getUser).toHaveBeenCalledTimes(1);
        expect(api.getList).toHaveBeenCalledTimes(1);
    });
});

test('async dependent sagas', async () => {
    return isolate(async () => {
        const HeaderAsync = createLoadComponent({
            asyncImport: () => import('./components/Header'),
            chunkName: () => 'Header',
            syncImport: () => require('./components/Header'),
        });

        const UserDetailsAsync = createLoadComponent({
            asyncImport: () => import('./components/UserDetails'),
            chunkName: () => 'UserDetails',
            syncImport: () => require('./components/UserDetails'),
        });

        const renderApp = ({ context, store, service, operationService }: GetProps<typeof App>) => (
            <App store={store} context={context} service={service} operationService={operationService}>
                <HeaderAsync>
                    <UserInfo id="1" fallback="">
                        <UserDetailsAsync id="1" />
                    </UserInfo>
                </HeaderAsync>
                <Content>
                    <Table fallback="" />
                </Content>
            </App>
        );

        const { hash, chunks, html, store } = await nodeRender(renderApp);
        expect(chunks).toEqual(['Header', 'UserDetails']);
        expect(api.getUser).toHaveBeenCalledTimes(1);
        expect(api.getList).toHaveBeenCalledTimes(1);
        expect(api.getUserDetails).toHaveBeenCalledTimes(1);

        // console.error = jest.fn(originError);

        await clientRender(renderApp, html, store.getState(), hash, chunks);
        expect(api.getUser).toHaveBeenCalledTimes(1);
        expect(api.getList).toHaveBeenCalledTimes(1);
        expect(api.getUserDetails).toHaveBeenCalledTimes(1);
        expect(global.window.document.getElementsByClassName('card').length).toBe(1);
        expect(global.window.document.getElementsByClassName('card')?.[0].innerHTML).toBe('**00');
    });
});

test('async dependent siblings', async () => {
    return isolate(async () => {
        const HeaderAsync = createLoadComponent({
            asyncImport: () => import('./components/Header'),
            chunkName: () => 'Header',
            syncImport: () => require('./components/Header'),
        });

        const UserDetailsAsync = createLoadComponent({
            asyncImport: () => import('./components/UserDetails'),
            chunkName: () => 'UserDetails',
            syncImport: () => require('./components/UserDetails'),
        });

        const renderApp = ({ context, store, service, operationService }: GetProps<typeof App>) => (
            <App store={store} context={context} service={service} operationService={operationService}>
                <Suspense fallback="">
                    <UserDetailsAsync id="1" />
                </Suspense>
                <HeaderAsync>
                    <UserInfo id="1" fallback="" />
                </HeaderAsync>
                <Content>
                    <Table fallback="" />
                </Content>
            </App>
        );

        const { hash, store, html, chunks } = await nodeRender(renderApp);
        expect(api.getUser).toHaveBeenCalledTimes(1);
        expect(api.getList).toHaveBeenCalledTimes(1);
        expect(api.getUserDetails).toHaveBeenCalledTimes(1);

        // console.error = jest.fn(originError);

        await clientRender(renderApp, html, store.getState(), hash, chunks);
        expect(api.getUser).toHaveBeenCalledTimes(1);
        expect(api.getList).toHaveBeenCalledTimes(1);
        expect(api.getUserDetails).toHaveBeenCalledTimes(1);
        expect(global.window.document.getElementsByClassName('card').length).toBe(1);
        expect(global.window.document.getElementsByClassName('card')?.[0].innerHTML).toBe('**00');
    });
});

test('multiple component instances', async () => {
    return isolate(async () => {
        const HeaderAsync = createLoadComponent({
            asyncImport: () => import('./components/Header'),
            chunkName: () => 'Header',
            syncImport: () => require('./components/Header'),
        });

        const UserDetailsAsync = createLoadComponent({
            asyncImport: () => import('./components/UserDetails'),
            chunkName: () => 'UserDetails',
            syncImport: () => require('./components/UserDetails'),
        });

        const renderApp = ({ context, store, service, operationService }: GetProps<typeof App>) => (
            <App store={store} context={context} service={service} operationService={operationService}>
                <HeaderAsync>
                    <UserInfo id="1" fallback="">
                        <UserDetailsAsync id="1" />
                    </UserInfo>
                    <UserInfo id="2" fallback="">
                        <UserDetailsAsync id="2" />
                    </UserInfo>
                </HeaderAsync>
            </App>
        );

        const { hash, store, html, chunks } = await nodeRender(renderApp);
        expect(api.getUser).toHaveBeenCalledTimes(2);
        expect(api.getUserDetails).toHaveBeenCalledTimes(2);

        // console.error = jest.fn(originError);

        await clientRender(renderApp, html, store.getState(), hash, chunks);
        expect(api.getUser).toHaveBeenCalledTimes(2);
        expect(api.getUserDetails).toHaveBeenCalledTimes(2);
        expect(global.window.document.getElementsByClassName('card').length).toBe(2);
        expect(global.window.document.getElementsByClassName('card')?.[0].innerHTML).toBe('**00');
        expect(global.window.document.getElementsByClassName('card')?.[1].innerHTML).toBe('**00');
    });
});
