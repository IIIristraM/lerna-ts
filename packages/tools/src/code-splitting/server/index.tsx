import React from 'react';
import { Stats } from 'webpack';
import serialize from 'serialize-javascript';

import { ChunksContext } from '../common/contexts';

export type PackageStats = Pick<Stats.ToJsonOutput, 'assetsByChunkName' | 'chunks' | 'publicPath'>;

export type Assets = {
    initial: string[];
    async: string[];
};

export type Resources = {
    publicPath: string;
    scripts: Assets;
    styles: Assets;
};

export class ChunksManager {
    private chunksToLoad: Set<string> = new Set();

    private registerChunk = (chunkName: string) => {
        this.chunksToLoad.add(chunkName);
    };

    public wrap = (children: React.ReactNode) => (
        <ChunksContext.Provider
            value={{
                registerChunk: this.registerChunk,
            }}
        >
            {children}
        </ChunksContext.Provider>
    );

    private prepareAssets(publicPath: string, assets: Assets, chunksToLoad: string[]) {
        const arr: string[] = [];
        const chunks = assets.async.filter(file => chunksToLoad.some(c => file.includes(c)));

        if (chunks.length) {
            arr.push(
                ...chunks.map(file => {
                    return `${publicPath}${file}`;
                }),
            );
        }

        for (const file of assets.initial) {
            arr.push(`${publicPath}${file}`);
        }

        return arr;
    }

    public getScripts() {
        return ({ resources }: { resources: Resources[] }) => {
            const chunksToLoad = Array.from(this.chunksToLoad);

            return (
                <>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.__CHUNKS_TO_LOAD__ = ${serialize(chunksToLoad)};
                            `,
                        }}
                    />
                    {resources.reduce((elements, { publicPath, scripts }) => {
                        this.prepareAssets(publicPath, scripts, chunksToLoad).forEach(asset => {
                            elements.push(<script key={asset} src={asset} />);
                        });

                        return elements;
                    }, [] as JSX.Element[])}
                </>
            );
        };
    }

    public getStyles() {
        return ({ resources }: { resources: Resources[] }) => {
            const chunksToLoad = Array.from(this.chunksToLoad);

            return (
                <>
                    {resources.reduce((elements, { publicPath, styles }) => {
                        this.prepareAssets(publicPath, styles, chunksToLoad).forEach(asset => {
                            elements.push(<link key={asset} rel="stylesheet" type="text/css" href={asset} />);
                        });

                        return elements;
                    }, [] as JSX.Element[])}
                </>
            );
        };
    }
}

export function processStats(stats: PackageStats[]) {
    const resources: Resources[] = [];

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

        resources.push(resource);
    }

    return resources;
}
