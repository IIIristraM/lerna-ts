import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RequestHandler, Request } from 'express';
import { StaticRouter } from 'react-router';
import { Readable } from 'stream';
import { Provider } from 'react-redux';

import App from '@project/client/app';
import { createStore } from '@project/common/infrastructure/store';
import { ChunksManager } from '@project/tools/code-splitting/server';

type TemplateProps = {
    req: Request;
};

function Template({ req }: TemplateProps) {
    const { resources } = req;
    const store = createStore(INITIAL_STATE);

    const chunksManager = new ChunksManager();
    const Scripts = chunksManager.getScripts();
    const Styles = chunksManager.getStyles();

    // stream with styles is not possible without static analysis of dependencies
    const children = ReactDOMServer.renderToString(
        chunksManager.wrap(
            <Provider store={store}>
                <StaticRouter location={req.url}>
                    <App />
                </StaticRouter>
            </Provider>,
        ),
    );

    return (
        <html lang="en">
            <head>
                <title>Project Template</title>
                <meta name="viewport" content="initial-scale=1"></meta>
                <meta name="Description" content="Project template."></meta>
                <Styles resources={resources} />
            </head>
            <body>
                <div
                    id="app"
                    dangerouslySetInnerHTML={{
                        __html: children,
                    }}
                />
                <script
                    id="state"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.__STATE_FROM_SERVER__ = ${JSON.stringify(store.getState())};
                        `,
                    }}
                />
                <Scripts resources={resources} />
            </body>
        </html>
    );
}

const INITIAL_STATE = {
    user: {
        login: 'noname',
    },
};

export default function render() {
    return function (req, res, next) {
        const prefixStream = Readable.from(['<!DOCTYPE html>']);

        const appStream = ReactDOMServer.renderToNodeStream(<Template req={req} />);

        prefixStream.pipe(res, { end: false });
        prefixStream.on('end', function () {
            appStream.pipe(res);
        });
    } as RequestHandler;
}
