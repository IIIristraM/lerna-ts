import { RequestHandler, Response } from 'express';
import { Stats } from 'webpack';
import fs from 'fs';
import path from 'path';

import { cacheFn } from '@project/common/utils/cache';
import { Resources, PackageStats } from '@project/tools/code-splitting/server';

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
    return (res.locals.webpackStats as Stats)
        .toJson()
        .children?.filter(({ name }) => name !== 'server') as PackageStats[];
};

export const exposeResources: RequestHandler = (req, res, next) => {
    const stats: PackageStats[] = process.env.NODE_ENV === 'development' ? readStatsDev(res) : readStats();

    req.resources = [];

    for (const item of stats) {
        const { publicPath } = item;
        if (!item.chunks || !publicPath) continue;

        const resource: Resources = {
            publicPath,
            scripts: {
                initial: [],
                async: [],
            },
            styles: {
                initial: [],
                async: [],
            },
        };

        for (const chunk of item.chunks) {
            const { files, initial } = chunk;

            for (const file of files) {
                if (['hot-update'].some(exclude => file.includes(exclude))) {
                    continue;
                }

                if (file.includes('.js')) {
                    (initial ? resource.scripts.initial : resource.scripts.async).push(file);
                }

                if (file.includes('.css')) {
                    (initial ? resource.styles.initial : resource.styles.async).push(file);
                }
            }
        }

        req.resources.push(resource);
    }

    next();
};
