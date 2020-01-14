import express from 'express';
import path from 'path';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';
import open from 'open';

import clientConfig from '../../client/webpack.config';
import commonConfig from '../../common/webpack.config';
import vendorsConfig from '../../vendors/webpack.config';
import { createWatchIgnore } from '../../webpack/src';

const PORT = 3000;

const configs = [
    vendorsConfig,
    commonConfig,
    clientConfig,
];

const compiler = webpack(configs);

const app = express();

app.use((function () {
    const webpackDevMiddlewareInstance = WebpackDevMiddleware(compiler, {
        publicPath: '/static/',
        lazy: false,
        stats: 'errors-warnings',
        watchOptions: {
            aggregateTimeout: 500,
            ignored: createWatchIgnore()
        },
        writeToDisk: true
    });

    compiler.hooks.watchRun.tapPromise('ChangesWatcher', async () => {
        for (let i = 0; i < compiler.compilers.length; i++) {
            const { watchFileSystem } = compiler.compilers[i];
            const { name } = configs[i];

            const watcher = watchFileSystem?.watcher || watchFileSystem?.wfs?.watcher
            if (!watcher) {
                return;
            }

            const changedFile = Object.keys(watcher.mtimes)
            console.log(name, changedFile);
        }

        return Promise.resolve();
    })

    webpackDevMiddlewareInstance.waitUntilValid(async () => {
        const url = `http://localhost:${PORT}/`;

        try {
            await open(url, { url: true, wait: true });
        } catch {
            console.log(`Site is available at ${url}`)
        }
    })

    return webpackDevMiddlewareInstance;
})());

app.use(WebpackHotMiddleware(compiler));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(PORT, function () {
    console.log('LISTENING');
});