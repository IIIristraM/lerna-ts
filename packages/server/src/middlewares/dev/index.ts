import { Express } from 'express';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import WebpackHotServerMiddleware from 'webpack-hot-server-middleware';
import webpack, { ProjectConfiguration } from 'webpack';

import clientConfig from '../../../../client/webpack.config';
import commonConfig from '../../../../common/webpack.config';
import vendorsConfig from '../../../../vendors/webpack.config';
import serverRenderConfig from '../../../webpack.render.config';

import webpackDevMiddleware from './webpack-dev';
import { exposeResources } from '../expose-resources';

const configs: ProjectConfiguration[] = [vendorsConfig, commonConfig, clientConfig, serverRenderConfig];

const compiler = webpack(configs);

export function configDev(app: Express) {
    app.use(webpackDevMiddleware(compiler, configs));
    app.use(exposeResources);

    app.use(
        WebpackHotMiddleware(compiler, {
            log: console.log,
        }),
    );

    app.use(
        WebpackHotServerMiddleware(compiler, {
            chunkName: 'index',
        }),
    );
}
