import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { RequestHandler } from 'express';
import { StaticRouter } from 'react-router';
import { Readable } from 'stream';

import App from '@project/client/app';

const Template: React.FC<{ styles?: string[], scripts?: string[] }> = ({
    children,
    styles = [],
    scripts = []
}) => (
        <html lang="en">
            <head>
                <title>Project Template</title>
                <meta name="viewport" content="initial-scale=1"></meta>
                <meta name="Description" content="Project template."></meta>
                {styles.map((style) => {
                    return <link key={style} rel="stylesheet" type="text/css" href={style}></link>
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

        const prefixStream = Readable.from(['<!DOCTYPE html>']);

        const appStram = ReactDOMServer.renderToNodeStream(
            <Template scripts={scripts} styles={styles}>
                <StaticRouter location={req.url}>
                    <App />
                </StaticRouter>
            </Template>
        );

        prefixStream.pipe(res, { end: false });
        prefixStream.on('end', function () {
            appStram.pipe(res);
        })
    } as RequestHandler
}