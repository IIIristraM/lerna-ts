import React from 'react'

import * as styles from './styles.css';

export const RightSidebar: React.FC = ({ children }) => {
    return (
        <div className={styles.rightSidebar}>{children}</div>
    )
}