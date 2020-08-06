import React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

import { link } from './styles.css';

const Link: React.FC<LinkProps> = ({ children, ...rest }) => {
    return (
        <RouterLink {...rest} className={link}>
            {children}
        </RouterLink>
    );
};

export default Link;
