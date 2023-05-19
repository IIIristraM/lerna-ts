import React from 'react';

import styles from './styles.css';

const Hello: React.FC = ({ children }) => {
    return <div className={styles.text}>Hello {children} !!</div>;
};

export default Hello;
