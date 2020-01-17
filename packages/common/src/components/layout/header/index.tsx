import React from 'react';

import { header } from './styles.css';

const Header: React.FC<{}> = ({ children }) => {
    return (
        <div className={header}>
            {children}
        </div>
    );
};

export default Header;