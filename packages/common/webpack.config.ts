import path from 'path';

import { init, addDll, processTypescript } from '../webpack/src';
import vendorsConfig from '../vendors/webpack.config';

const NAME = 'common';

const config = init({
    name: NAME,
    dll: true,
    context: path.resolve(__dirname)
});

processTypescript(config)
addDll(config, vendorsConfig.name)

export default config;
