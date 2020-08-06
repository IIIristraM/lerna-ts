/// <reference path="../typings/src/webpack/index.d.ts" />

import path from 'path';
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';

import { init } from '../webpack/src';

const NAME = 'vendors';

const config = init({
    name: NAME,
    dll: true,
    context: path.resolve(__dirname),
    entry: ['react', 'react-dom', 'react-router', 'react-router-dom', 'redux', 'react-redux'],
});

if (config.mode === 'production') {
    config.plugins.push(
        new HardSourceWebpackPlugin({
            cacheDirectory: path.resolve(`../../node_modules/.cache/hard-source-webpack-plugin/${NAME}`),
        }),
    );
}

export default config;
