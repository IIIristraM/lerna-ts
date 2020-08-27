import { StatsWriterPlugin } from 'webpack-stats-plugin';

export class StatsPlugin extends StatsWriterPlugin {
    constructor() {
        super({
            fields: ['assetsByChunkName', 'chunks', 'publicPath'],
            transform: data =>
                JSON.stringify(
                    {
                        timestamp: Date.now(),
                        ...data,
                    },
                    null,
                    2,
                ),
        });
    }
}
