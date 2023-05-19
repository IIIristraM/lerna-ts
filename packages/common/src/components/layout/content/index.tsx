import React from 'react';

import styles from './styles.css';

const Content: React.FC<{}> = ({ children }) => {
    return <div className={styles.content}>{children}</div>;
};

export default Content;
