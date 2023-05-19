import React from 'react';

import styles from './styles.css';

const Header: React.FC<{}> = ({ children }) => {
    return <div className={styles.header}>{children}</div>;
};

export default Header;
