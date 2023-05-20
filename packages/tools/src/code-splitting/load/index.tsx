import React, { ComponentType, useState, useEffect, useContext } from 'react';

import { isNodeEnv } from '../utils';
import { ChunksContext } from '../common/contexts';

type LoadablePrivateOptions<T extends ComponentType> = {
    chunkName: () => string;
    asyncImport: () => Promise<T | { default: T }>;
    syncImport: () => any;
};

type LoadablePublicOptions<T extends ComponentType> = {
    import: LoadablePrivateOptions<T>['asyncImport'];
    Loader?: React.ComponentType<any>;
    Renderer?: React.ComponentType<{ Component: T | null } & GetProps<T>>;
};

type LoadableOptions<T extends ComponentType> = LoadablePrivateOptions<T> & Omit<LoadablePublicOptions<T>, 'import'>;

type LoadComponentProps<T extends ComponentType> = {
    options: LoadableOptions<T>;
};

declare const __CHUNKS_TO_LOAD__: string[];

function getModule<T extends ComponentType>(m: T | { default: T }) {
    return m instanceof Function ? m : m.default;
}

function Load<T extends ComponentType>({ options, ...rest }: LoadComponentProps<T> & GetProps<T>) {
    const { Renderer, Loader } = options;
    const context = useContext(ChunksContext);
    const chunkName = options.chunkName();
    const isAsync = !isNodeEnv() && !__CHUNKS_TO_LOAD__?.includes(chunkName);

    if (isNodeEnv()) {
        options.asyncImport().catch(() => {
            /* require chunk */
        });
    }

    const [{ Component }, setComponent] = useState<{ Component: T | null }>({
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

    return Renderer ? (
        <Renderer Component={Component} {...(rest as any)} />
    ) : Component ? (
        <Component {...(rest as any)} />
    ) : Loader ? (
        <Loader />
    ) : null;
}

export const createLoadComponent = <T extends ComponentType>(options: LoadableOptions<T>) => (
    props: Omit<LoadComponentProps<T>, 'options'> & GetProps<T>,
) => <Load options={options} {...props} />;

type OuterComponent<T extends ComponentType> = React.ComponentType<
    GetProps<T> & Omit<LoadComponentProps<T>, 'options'>
>;

export function load<T extends ComponentType>(fn: LoadableOptions<T>['asyncImport']): OuterComponent<T>;
export function load<T extends ComponentType>(options: LoadablePublicOptions<T>): OuterComponent<T>;

export function load(options: any): React.ComponentType<any> {
    return createLoadComponent(options);
}
