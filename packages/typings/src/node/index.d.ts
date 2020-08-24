/// <reference path="../../../../node_modules/@types/node/ts3.2/index.d.ts" />

type NodeEnv = 'development' | 'production' | undefined;

declare namespace NodeJS {
    interface ProcessEnv {
        [key: string]: string | undefined;
        NODE_ENV: NodeEnv;
    }
}

declare const NODE_ENV: NodeEnv;

declare interface NodeRequire {
    resolveWeak: (path: string) => string;
}
