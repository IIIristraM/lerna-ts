import path from 'path';
import nodeExternals from 'webpack-node-externals';

import { init, processTypescript, addAliases } from '../webpack/src';
import commonConfig from '../common/webpack.config';
import clientConfig from '../client/webpack.config';

const NAME = 'server';

const config = init({
    name: NAME,
    context: path.resolve(__dirname),
    hot: false,
    entry: [
        './src/render'
    ]
});

config.target = 'node';
config.output.libraryTarget = 'commonjs2';
config.externals = [
    nodeExternals({
        modulesDir: '../../node_modules'
    })
]

processTypescript(config);
addAliases(config, clientConfig.name);
addAliases(config, commonConfig.name);

export default config;