import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter } from 'react-router-dom';

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

ReactDOM.hydrate((
    <BrowserRouter>
        <App />
    </BrowserRouter>
), appEl);
