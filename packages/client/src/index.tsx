import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { createStore } from '@project/common/infrastructure/store';

import App from './app';

import './styles.css';

const ROOT_ID = "app" as const;

const appEl = document.getElementById(ROOT_ID);

if (appEl === null) {
    console.error(
        "React application failed to mount, no such element with id:",
        ROOT_ID
    );
}

const store = createStore(window.__STATE_FROM_SERVER__);
delete window.__STATE_FROM_SERVER__;
document.getElementById('state')?.remove();

ReactDOM.hydrate((
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
), appEl);
