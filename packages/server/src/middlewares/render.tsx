import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RequestHandler } from 'express';
import { StaticRouter } from 'react-router';

import App from '@project/client/app';

const Template: React.FC<{ styles?: string[], scripts?: string[] }> = ({
    children,
    styles = [],
    scripts = []
}) => (
        <html>
            <head>
                {styles.map((style) => {
                    return <link key={style} rel="stylesheet" href={style}></link>
                })}
            </head>
            <body>
                <div id="app">
                    {children}
                </div>
                {scripts.map((script) => {
                    return <script key={script} src={script}></script>
                })}
            </body>
        </html>
    )

export default function render() {
    return function (req, res, next) {
        const { locals: { scripts, styles } } = res;

        ReactDOMServer.renderToNodeStream(
            <Template scripts={scripts} styles={styles}>
                <StaticRouter location={req.url}>
                    <App />
                </StaticRouter>
            </Template>
        ).pipe(res);
    } as RequestHandler
}