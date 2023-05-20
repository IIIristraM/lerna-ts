import { applyMiddleware, createStore as createStoreBase, Store } from 'redux';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './reducers';
import type { CommonState } from './reducers';

let __store: Store<CommonState>;

export function createStore(preloadedState: CommonState) {
    const sagaMiddleware = createSagaMiddleware();

    __store = applyMiddleware(sagaMiddleware)(createStoreBase)(rootReducer, preloadedState);
    return {
        store: getStore(),
        sagaMiddleware,
    };
}

export default function getStore() {
    if (!__store) {
        throw new Error('Store was requested before initialization');
    }

    return __store;
}

export type { CommonState } from './reducers';
