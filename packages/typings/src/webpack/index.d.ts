import { Configuration } from 'webpack';

declare global {
    function __webpack_require__<T>(id: string): T;
}

declare module 'webpack' {
    export type ProjectConfiguration = Configuration & {
        name: string;
        context: string;
        entry: {
            index: string[];
            [x: string]: string[];
        };
        output: NonNullable<Configuration['output']>;
        plugins: NonNullable<Configuration['plugins']>;
        resolve: NonNullable<Configuration['resolve']>;
        externals: NonNullable<Configuration['externals']>;
    };
}
