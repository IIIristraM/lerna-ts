import { RequestHandler } from 'express';
import { Stats } from 'webpack';
import fs from 'fs';
import path from 'path';

import { cacheFn } from '@project/common/utils/cache';

import { STATIC_PATH } from '../consts';

const parseWebpackStats = (stats: Stats) => {
    const { children = [] } = stats.toJson();

    return children.filter(child => child.name !== 'server').reduce((
        resources,
        { publicPath = '/', assetsByChunkName }
    ) => {
        const files: string | string[] | Record<string, string | string[]> = (assetsByChunkName || {})['index'];

        if (typeof files === 'string') {
            resources.push(`${publicPath}${files}`);
        } else if (Array.isArray(files)) {
            files.forEach(file => {
                resources.push(`${publicPath}${file}`)
            })
        } else {
            Object.values(files).forEach(file => {
                if (typeof file === 'string') {
                    resources.push(`${publicPath}${file}`)
                    return;
                }

                file.forEach(f => {
                    resources.push(`${publicPath}${f}`)
                })
            })
        }

        return resources.filter(r => {
            return !r.includes('hot-update')
        });
    }, [] as string[])
}

const parseManifests = cacheFn(() => {
    const resources: string[] = [];
    const manifests: Manifest[] = [];
    const staticDirs = fs.readdirSync(STATIC_PATH);

    for (const dir of staticDirs) {
        const manifestPath = path.resolve(STATIC_PATH, dir, 'manifest.json');
        const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifests.push(manifest);
    }

    manifests.sort(({ timestamp: t1 }, { timestamp: t2 }) => t1 - t2);
    manifests.forEach(({ resources: r }) => {
        resources.push(...r);
    })

    console.log('RESOURSES USED:', resources);

    return resources;
});

export const exposeResources: RequestHandler = (req, res, next) => {
    const resources = res.locals.webpackStats
        ? parseWebpackStats(res.locals.webpackStats)
        : parseManifests();

    res.locals.scripts = resources.filter(r => /\.js$/.test(r));
    res.locals.styles = resources.filter(r => /\.css$/.test(r));

    next();
}