import WebpackDevMiddleware from 'webpack-dev-middleware';
import open from 'open';
import { MultiCompiler, ProjectConfiguration } from 'webpack';

import { createWatchIgnore } from '../../../../webpack/src';
import { PUBLIC_PATH, PORT } from '../../consts';

export default function webpackDevMiddleware(compiler: MultiCompiler, configs: ProjectConfiguration[]) {
    const webpackDevMiddlewareInstance = WebpackDevMiddleware(compiler, {
        publicPath: PUBLIC_PATH,
        lazy: false,
        stats: {
            all: false,
            assets: true,
            errors: true,
            warnings: true,
        },
        watchOptions: {
            aggregateTimeout: 500,
            ignored: createWatchIgnore(),
        },
        logLevel: 'info',
        writeToDisk: true, // required for IDE handle TS errors
        serverSideRender: true,
    });

    compiler.hooks.watchRun.tapPromise('ChangesWatcher', async () => {
        console.log('------------- REBUILD TRIGGERED BY -------------');

        for (let i = 0; i < compiler.compilers.length; i++) {
            const { watchFileSystem } = compiler.compilers[i];
            const { name } = configs[i];

            const watcher = watchFileSystem?.watcher || watchFileSystem?.wfs?.watcher;
            if (!watcher) {
                return;
            }

            const changedFile = Object.keys(watcher.mtimes);
            console.log(name, changedFile);
        }

        return Promise.resolve();
    });

    webpackDevMiddlewareInstance.waitUntilValid(async () => {
        const url = `http://localhost:${PORT}/`;

        try {
            await open(url, { url: true, wait: true });
        } catch {
            console.log(`Site is available at ${url}`);
        }
    });

    return webpackDevMiddlewareInstance;
}
