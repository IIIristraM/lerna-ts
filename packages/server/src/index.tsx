import express from 'express';

import { PORT, PUBLIC_PATH } from './consts';
import { exposeResources } from './middlewares/expose-resources';
import { serveStatic } from './middlewares/serve-static';

const app = express();
let promise = Promise.resolve();

if (process.env.NODE_ENV === 'development') {
    const { configDev } = require('./middlewares/dev');
    configDev(app);
} else {
    promise = import('./middlewares/render').then(({ default: render }) => {
        app.get(`${PUBLIC_PATH}*`, serveStatic);
        app.use(exposeResources);
        app.use(render());
    })
}

promise.then(() => {
    app.listen(PORT, function () {
        console.log('---------------- LISTENING ----------------');
    });
});