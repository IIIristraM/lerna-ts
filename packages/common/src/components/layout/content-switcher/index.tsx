import React from 'react';

import { useOperation } from '@iiiristram/sagun';

import { LAYOUT_OPERATION_ID } from '../../../consts';

import styles from './styles.css';

export const ContentSwitcher: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const { result: layoutState } = useOperation({ operationId: LAYOUT_OPERATION_ID }) ?? {};

    const className = [styles.switcher, layoutState?.rightSide ? styles.right : undefined].filter(Boolean).join(' ');

    return (
        <div className={styles.hide}>
            <div className={className}>{children}</div>
        </div>
    );
};
