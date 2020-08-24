import React, { ComponentType, useState, useEffect, useContext } from 'react';

import { isNodeEnv } from '../utils';
import { ChunksContext } from '../common/contexts';

type LoadableOptions<T> = {
    chunkName: () => string;
    asyncImport: () => Promise<T | { default: T }>;
    syncImport: () => any;
};

declare const __CHUNKS_TO_LOAD__: string[];

function getModule<T extends ComponentType>(m: T | { default: T }) {
    return m instanceof Function ? m : m.default;
}

function Load<T extends ComponentType>({ options, ...rest }: { options: LoadableOptions<T> } & Record<string, any>) {
    const context = useContext(ChunksContext);
    const chunkName = options.chunkName();
    const isAsync = !isNodeEnv() && !__CHUNKS_TO_LOAD__?.includes(chunkName);

    if (isNodeEnv()) {
        options.asyncImport().catch(() => {/* require chunk */})
    }

    const [{ Component }, setComponent] = useState<{ Component: ComponentType | null }>({
        Component: isAsync ? null : getModule(options.syncImport()),
    });

    if (context) {
        context?.registerChunk(chunkName);
    }

    useEffect(() => {
        if (!isAsync) return;

        options.asyncImport().then(C => {
            setComponent({ Component: C instanceof Function ? C : C.default });
        });
    }, []);

    return Component ? <Component {...rest} /> : null;
}

const createLoadComponent = <T extends ComponentType>(options: LoadableOptions<T>) => (props: Record<string, any>) => (
    <Load options={options} {...props} />
);

export function load<T extends ComponentType>(fn: LoadableOptions<T>['asyncImport']): React.ComponentType;
export function load<T extends ComponentType>(options: LoadableOptions<T>): React.ComponentType;

export function load(options: any): React.ComponentType {
    return createLoadComponent(options);
}
