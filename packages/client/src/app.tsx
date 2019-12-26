import React from 'react';
import ReactDOM from "react-dom";
import { Hello } from "@project/common/components";
import { square } from "@project/common/utils";

const ROOT_ID = "app" as const;

export function start() {
    const appEl = document.getElementById(ROOT_ID);

    if (appEl === null) {
        console.error(
            "React application failed to mount, no such element with id:",
            ROOT_ID
        );

        return;
    }

    ReactDOM.render(<Hello>{square(8 as Double)}</Hello>, appEl);
}
