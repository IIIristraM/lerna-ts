import express from 'express';

import { PORT, PUBLIC_PATH } from './consts';
import { exposeResources } from './middlewares/expose-resources';
import render from './middlewares/render';
import { serveStatic } from './middlewares/serve-static';

const app = express();

if (process.env.NODE_ENV === 'development') {
    const { configDev } = require('./middlewares/dev');
    configDev(app);
} else {
    app.get(`${PUBLIC_PATH}*`, serveStatic);
    app.use(exposeResources);
    app.use(render());
}

app.listen(PORT, function () {
    console.log('---------------- LISTENING ----------------');
});