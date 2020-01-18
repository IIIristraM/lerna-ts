import { createStore as createStoreBase, Store } from 'redux';

import rootReducer, { CommonState } from './reducers';

let __store: Store<CommonState>;

export function createStore(preloadedState: CommonState) {
    __store = createStoreBase(rootReducer, preloadedState);
    return getStore();
};

export default function getStore() {
    if (!__store) {
        throw new Error('Store was requested before initialization');
    }

    return __store;
};
