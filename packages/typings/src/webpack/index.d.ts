import webpack, { Resolve } from 'webpack';
import Watchpack from 'watchpack';

declare module 'webpack' {
    interface NodeWatchFileSystem {
        watcher?: Watchpack;
        wfs?: {
            watcher: Watchpack
        }
    }

    interface Compiler {
        watchFileSystem?: NodeWatchFileSystem;
    }

    export type ProjectConfiguration = Configuration & {
        name: string;
        context: string
        entry: {
            index: string[];
            [x: string]: string[];
        }
        output: webpack.Output;
        plugins: webpack.Plugin[];
        resolve: Resolve;
        externals: webpack.ExternalsElement[];
    }
}