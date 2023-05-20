/// <reference path="../typings/src/webpack/index.d.ts" />

import path from 'path';

import { init, addDll, processTypescript, processStyles, addAliases } from '../webpack/src';
import vendorsConfig from '../vendors/webpack.config';

const NAME = 'common';

const config = init({
    name: NAME,
    dll: true,
    context: path.resolve(__dirname),
});

processTypescript(config);
processStyles(config);
addDll(config, vendorsConfig.name);
addAliases(config, 'tools');

export default config;
