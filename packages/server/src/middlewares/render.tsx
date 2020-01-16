import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RequestHandler } from 'express';
import { StaticRouter } from 'react-router';

import App from '@project/client/app';

export default function render() {
    const Template: React.FC<{ resources: string[] }> = ({ children, resources }) => (
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
                {resources.map((resource) => {
                    return <script key={resource} src={resource}></script>
                })}
            </body>
        </html>
    )

    return function (req, res, next) {
        const { locals: { resources } } = res;

        ReactDOMServer.renderToNodeStream(
            <Template resources={resources}>
                <StaticRouter location={req.url}>
                    <App />
                </StaticRouter>
            </Template>
        ).pipe(res);
    } as RequestHandler
}