import React from 'react';
import { NavLink as RouterLink, LinkProps } from 'react-router-dom';

import { useSaga } from '@iiiristram/sagun';

import styles from './styles.css';

function* onLoad() {
    yield* [1];
}

const Link: React.FC<LinkProps> = ({ children, ...rest }) => {
    useSaga({ onLoad });

    return (
        <RouterLink {...rest} activeClassName={styles.active} className={styles.link} exact>
            {children}
        </RouterLink>
    );
};

export default Link;
