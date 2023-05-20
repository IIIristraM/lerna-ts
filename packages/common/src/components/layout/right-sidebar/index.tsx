import React from 'react';

import styles from './styles.css';

export const RightSidebar: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    return <div className={styles.rightSidebar}>{children}</div>;
};
