/// <reference path="../typings/src/webpack/index.d.ts" />

import path from 'path';

import { init, addDll, processTypescript } from '../webpack/src';
import commonConfig from '../common/webpack.config';
import vendorsConfig from '../vendors/webpack.config';

const NAME = 'client';

const config = init({
    name: NAME,
    context: path.resolve(__dirname)
});

processTypescript(config)
addDll(config, vendorsConfig.name)
addDll(config, commonConfig.name)

export default config;
