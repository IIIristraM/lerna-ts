import React from 'react';

import styles from './styles.css';

const Content: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    return (
        <div className={styles.content}>
            <div className={styles.inner}>{children}</div>
        </div>
    );
};

export default Content;
