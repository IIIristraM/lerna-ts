import path from 'path';

import { init } from '../webpack/src';

const NAME = 'vendors';

export default init({
    name: NAME,
    dll: true,
    context: path.resolve(__dirname),
    entry: [
        'react',
        'react-dom',
        'react-router',
        'react-router-dom'
    ]
});