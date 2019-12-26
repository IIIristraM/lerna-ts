import { init, addDll, processTypescript } from '../webpack/src';
import vendorsConfig from '../vendors/webpack.config';

const NAME = 'common';

const config = init({
    name: NAME,
    dll: true,
    context: __dirname
});

processTypescript(config)
addDll(config, vendorsConfig.name)

export default config;
