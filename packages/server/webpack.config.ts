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
    entry: ['./src/index'],
});

processTypescript(config);
processStyles(config);
addAliases(config, 'tools');
addAliases(config, clientConfig.name);
addAliases(config, commonConfig.name);

// exclude webpack dependencies from production build
Array.isArray(config.externals) &&
    config.externals.push(function ({ context, request, contextInfo, getResolve }, callback) {
        if (request && /[.]\/middlewares\/dev/.test(request)) {
            return callback(undefined, 'commonjs ' + request);
        }

        callback();
    });

export default config;
