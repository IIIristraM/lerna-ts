import React from 'react';

import * as styles from './styles.css';

export const Navigation: React.FC = ({ children }) => {
    return <div className={styles.navigation}>{children}</div>
}