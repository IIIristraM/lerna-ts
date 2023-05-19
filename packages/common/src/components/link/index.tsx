import React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

import styles from './styles.css';

const Link: React.FC<LinkProps> = ({ children, ...rest }) => {
    return (
        <RouterLink {...rest} className={styles.link}>
            {children}
        </RouterLink>
    );
};

export default Link;
