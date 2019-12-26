import { init } from '../webpack/src';

const NAME = 'vendors';

export default init({
    name: NAME,
    dll: true,
    context: __dirname,
    entry: [
        'react',
        'react-dom'
    ]
});