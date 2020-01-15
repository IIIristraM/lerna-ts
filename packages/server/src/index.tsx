import express from 'express';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import WebpackHotServerMiddleware from 'webpack-hot-server-middleware';
import webpack from 'webpack';
import open from 'open';

import { createWatchIgnore } from '../../webpack/src';
import clientConfig from '../../client/webpack.config';

import { PUBLIC_PATH, PORT, configs } from './consts';

const compiler = webpack(configs);
const app = express();

app.use((function () {
    const webpackDevMiddlewareInstance = WebpackDevMiddleware(compiler, {
        publicPath: PUBLIC_PATH,
        lazy: false,
        stats: 'errors-warnings',
        watchOptions: {
            aggregateTimeout: 500,
            ignored: createWatchIgnore()
        },
        logLevel: 'warn',
        writeToDisk: true // required for IDE handle TS errors
    });

    compiler.hooks.watchRun.tapPromise('ChangesWatcher', async () => {
        console.log('------------- REBUILD TRIGGERED BY -------------');

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

const clienCompiler = compiler.compilers.find(c => c.name === clientConfig.name);
if (clienCompiler) {
    app.use(WebpackHotMiddleware(clienCompiler, {
        log: console.log,
        noInfo: true
    }));
}

app.use(WebpackHotServerMiddleware(compiler, {
    chunkName: 'index'
}));

app.listen(PORT, function () {
    console.log('---------------- LISTENING ----------------');
});