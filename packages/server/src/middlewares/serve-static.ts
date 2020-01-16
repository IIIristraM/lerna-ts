import { RequestHandler } from 'express';
import path from 'path';

import { STATIC_PATH } from '../consts';

export const serveStatic: RequestHandler = (req, res) => {
    const [, pkg, ...pathToResource] = req.url.split('/').filter(Boolean);
    const filePath = path.resolve(STATIC_PATH, pkg, ...pathToResource);

    res.sendFile(filePath)
} 