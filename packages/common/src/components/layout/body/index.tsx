import React from 'react';

import styles from './styles.css';

const Body: React.FC<{}> = ({ children }) => {
    return <div className={styles.body}>{children}</div>;
};

export default Body;
