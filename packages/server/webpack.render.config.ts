/// <reference path="../typings/src/webpack/index.d.ts" />

import path from 'path';

import { init, processTypescript, addAliases, processStyles } from '../webpack/src';
import commonConfig from '../common/webpack.config';
import clientConfig from '../client/webpack.config';

const NAME = 'server';

const config = init({
    name: NAME,
    context: path.resolve(__dirname),
    hot: false,
    target: 'node',
    entry: ['./src/middlewares/render'],
});

config.output.libraryTarget = 'commonjs2';

processTypescript(config);
processStyles(config);
addAliases(config, clientConfig.name);
addAliases(config, commonConfig.name);

export default config;
