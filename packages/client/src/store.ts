import { createStore } from '@project/common/infrastructure/store';

const w = typeof window === "undefined" ? {} as any : window;

const storeConfig = createStore(w.__STATE_FROM_SERVER__);
delete w.__STATE_FROM_SERVER__;

export const store = storeConfig.store;
export const sagaMiddleware = storeConfig.sagaMiddleware;