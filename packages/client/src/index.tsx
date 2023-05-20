import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { call } from 'typed-redux-saga';

import { createStore, CommonState } from '@project/common/infrastructure/store';
import { useOperation, ComponentLifecycleService, OperationService, Root } from '@iiiristram/sagun';

import App from './components/app';

import './styles.css';

const ROOT_ID = 'app' as const;

const appEl = document.getElementById(ROOT_ID);

if (appEl === null) {
    console.error('React application failed to mount, no such element with id:', ROOT_ID);
}

const { store, sagaMiddleware } = createStore(window.__STATE_FROM_SERVER__);
delete window.__STATE_FROM_SERVER__;
document.getElementById('state')?.remove();

const operationService = new OperationService({ hash: window.__SSR_CONTEXT__ });
const service = new ComponentLifecycleService(operationService);

sagaMiddleware.run(function* () {
    yield* call(operationService.run);
    yield* call(service.run);
});

useOperation.setPath((state: CommonState) => state.asyncOperations);

ReactDOM.hydrate(
    <Root operationService={operationService} componentLifecycleService={service}>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </Root>,
    appEl!,
);

delete window.__SSR_CONTEXT__;
document.getElementById('hash')?.remove();
