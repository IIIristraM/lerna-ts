import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { call } from 'typed-redux-saga';
import { useOperation, ComponentLifecycleService, OperationService, Root } from '@iiiristram/sagun';

import { CommonState } from '@project/common/infrastructure/store';

import App from './components/app';
import { sagaMiddleware, store } from './store';

import './styles.css';

const ROOT_ID = 'app' as const;

const appEl = document.getElementById(ROOT_ID);

if (appEl === null) {
    console.error('React application failed to mount, no such element with id:', ROOT_ID);
}


document.getElementById('state')?.remove();

const operationService = new OperationService({ hash: window.__SSR_CONTEXT__ });
const service = new ComponentLifecycleService(operationService);

sagaMiddleware.run(function* () {
    yield* call(operationService.run);
    yield* call(service.run);
});

useOperation.setPath((state: CommonState) => state.asyncOperations);

// ReactDOM.hydrateRoot(
//     appEl!,
//     <Root operationService={operationService} componentLifecycleService={service}>
//         <Provider store={store}>
//             <BrowserRouter>
//                 <App />
//             </BrowserRouter>
//         </Provider>
//     </Root>,
// );

const root = ReactDOM.createRoot(
    appEl!
)

root.render(    
    <Root operationService={operationService} componentLifecycleService={service}>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </Root>,
);

delete window.__SSR_CONTEXT__;
document.getElementById('hash')?.remove();
