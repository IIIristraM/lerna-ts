import 'webpack';
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
}