import React from 'react';

import styles from './styles.css';

const Hello: React.FC = ({ children }) => <div className={styles.text}>Hello {children} !</div>;

export default Hello;
