import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RequestHandler } from 'express';
import { StaticRouter } from 'react-router';

import App from '@project/client/app';

import { PUBLIC_PATH, clientConfigs } from './consts';

export default function render() {
    const Template: React.FC<{}> = ({ children }) => (
        <html>
            <head>
                <style>
                    {`* {
                        box-sizing: border-box;
                    }
                    
                    html, body {
                        padding: 0;
                        margin: 0;
                    }`}
                </style>
            </head>
            <body>
                <div id="app">
                    {children}
                </div>
                {clientConfigs.map(({ name, output: { library } }) => (
                    <script key={name} src={`${PUBLIC_PATH}${name}/index.bundle${library ? '.dll' : ''}.js`}></script>
                ))}
            </body>
        </html>
    )

    return function (req, res, next) {
        ReactDOMServer.renderToNodeStream(
            <Template>
                <StaticRouter location={req.url}>
                    <App />
                </StaticRouter>
            </Template>
        ).pipe(res);
    } as RequestHandler
}