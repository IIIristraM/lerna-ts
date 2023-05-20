import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RequestHandler, Request } from 'express';
import { StaticRouter } from 'react-router';
import { Readable } from 'stream';
import { Provider } from 'react-redux';
import serialize from 'serialize-javascript';
import { Store } from 'redux';
import { call } from 'typed-redux-saga';
import { Map } from 'immutable';

import App from '@project/client/components/app';
import { CommonState, createStore } from '@project/common/infrastructure/store';
import { ChunksManager } from '@project/tools/code-splitting/server';
import { useOperation, ComponentLifecycleService, OperationService, Root, SagaClientHash, AsyncOperation } from '@iiiristram/sagun';
import { renderToStringAsync } from '@iiiristram/sagun/server';

type TemplateProps = {
    req: Request;
    chunksManager: ChunksManager;
    children: string;
    hash?: SagaClientHash;
    store: Store<CommonState>;
};

useOperation.setPath((state: CommonState) => state.asyncOperations);

const SsrApp = ({
    store,
    url,
    service,
    operationService,
}: { url: string; service: ComponentLifecycleService; operationService: OperationService } & Pick<
    TemplateProps,
    'store'
>) => (
    <Root operationService={operationService} componentLifecycleService={service}>
        <Provider store={store}>
            <StaticRouter location={url}>
                <App />
            </StaticRouter>
        </Provider>
    </Root>
);

function Template({ req, chunksManager, children, store, hash }: TemplateProps) {
    const { resources } = req;

    const Scripts = chunksManager.getScripts();
    const Styles = chunksManager.getStyles();

    return (
        <html lang="en">
            <head>
                <title>Project Template</title>
                <meta name="viewport" content="initial-scale=1"></meta>
                <meta name="Description" content="Project template."></meta>
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
                    rel="stylesheet"
                />
                <Styles resources={resources} />
            </head>
            <body>
                <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
                <script
                    id="state"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.__STATE_FROM_SERVER__ = ${serialize(store.getState())};
                        `,
                    }}
                />
                <script
                    id="hash"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.__SSR_CONTEXT__ = ${serialize(hash)};
                        `,
                    }}
                />
                <Scripts resources={resources} />
            </body>
        </html>
    );
}

export default function render() {
    return async function (req, res, next) {
        const prefixStream = Readable.from(['<!DOCTYPE html>']);

        const operationService = new OperationService({ hash: {} });
        const service = new ComponentLifecycleService(operationService);
        const chunksManager = new ChunksManager();
        const { store, sagaMiddleware } = createStore({
            asyncOperations: Map<string, AsyncOperation>(),
        });
        const task = sagaMiddleware.run(function* () {
            yield* call(operationService.run);
            yield* call(service.run);
        });

        // chunks have to be extracted after sagas executed
        // due to cases when new dynamic component rendered after store fulfilled
        const html = await renderToStringAsync(
            chunksManager.wrap(
                <SsrApp store={store} url={req.url} service={service} operationService={operationService} />,
            ),
        );

        task.cancel();
        await task.toPromise();

        const appStream = ReactDOMServer.renderToNodeStream(
            <Template store={store} hash={operationService.getHash()} req={req} chunksManager={chunksManager}>
                {html}
            </Template>,
        );

        prefixStream.pipe(res, { end: false });
        prefixStream.on('end', function () {
            appStream.pipe(res);
        });
    } as RequestHandler;
}
