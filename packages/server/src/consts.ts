import { ProjectConfiguration } from 'webpack';

import clientConfig from '../../client/webpack.config';
import commonConfig from '../../common/webpack.config';
import vendorsConfig from '../../vendors/webpack.config';
import serverRenderConfig from '../webpack.render.config';

export const PUBLIC_PATH = '/static/';
export const PORT = 3000;
export const configs: ProjectConfiguration[] = [
    vendorsConfig,
    commonConfig,
    clientConfig,
    serverRenderConfig
];
export const clientConfigs = configs.filter(c => c.target !== 'node');
