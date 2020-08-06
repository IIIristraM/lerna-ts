import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RequestHandler } from 'express';
import { StaticRouter } from 'react-router';
import { Readable } from 'stream';
import { Provider } from 'react-redux';

import App from '@project/client/app';
import { createStore } from '@project/common/infrastructure/store';
import { CommonState } from '@project/common/infrastructure/reducers';

type TemplateProps = {
    styles: string[];
    scripts: string[];
    state: CommonState;
};

const Template: React.FC<TemplateProps> = ({ children, styles, scripts, state }) => (
    <html lang="en">
        <head>
            <title>Project Template</title>
            <meta name="viewport" content="initial-scale=1"></meta>
            <meta name="Description" content="Project template."></meta>
            {styles.map(style => {
                return <link key={style} rel="stylesheet" type="text/css" href={style}></link>;
            })}
        </head>
        <body>
            <div id="app">{children}</div>
            <script
                id="state"
                dangerouslySetInnerHTML={{ __html: `window.__STATE_FROM_SERVER__ = ${JSON.stringify(state)}` }}
            />
            {scripts.map(script => {
                return <script key={script} src={script}></script>;
            })}
        </body>
    </html>
);

const INITIAL_STATE = {
    user: {
        login: 'noname',
    },
};

export default function render() {
    return function (req, res, next) {
        const {
            locals: { scripts, styles },
        } = res;
        const store = createStore(INITIAL_STATE);

        const prefixStream = Readable.from(['<!DOCTYPE html>']);

        const appStram = ReactDOMServer.renderToNodeStream(
            <Template scripts={scripts} styles={styles} state={store.getState()}>
                <Provider store={store}>
                    <StaticRouter location={req.url}>
                        <App />
                    </StaticRouter>
                </Provider>
            </Template>,
        );

        prefixStream.pipe(res, { end: false });
        prefixStream.on('end', function () {
            appStram.pipe(res);
        });
    } as RequestHandler;
}
