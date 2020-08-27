import { RequestHandler, Response } from 'express';
import { Stats } from 'webpack';
import fs from 'fs';
import path from 'path';

import { cacheFn } from '@project/common/utils/cache';
import { Resources, processStats } from '@project/tools/code-splitting/server';

import { STATIC_PATH } from '../consts';

declare global {
    namespace Express {
        interface Request {
            resources: Resources[];
        }
    }
}

const readStats = cacheFn(() => {
    type StatsContent = Stats.ToJsonOutput & { timestamp: number };
    const stats: StatsContent[] = [];
    const staticDirs = fs.readdirSync(STATIC_PATH);

    for (const dir of staticDirs) {
        const statsPath = path.resolve(STATIC_PATH, dir, 'stats.json');
        const content: StatsContent = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        stats.push(content);
    }

    stats.sort(({ timestamp: t1 }, { timestamp: t2 }) => t1 - t2);

    return stats;
});

const readStatsDev = (res: Response) => {
    const { children } = (res.locals.webpackStats as Stats).toJson();

    if (!children) {
        throw new Error('Multi-compiler compilation expected');
    }
    return children.filter(({ name }) => name !== 'server');
};

export const exposeResources: RequestHandler = (req, res, next) => {
    const stats = process.env.NODE_ENV === 'development' ? readStatsDev(res) : readStats();
    req.resources = processStats(stats);
    next();
};
