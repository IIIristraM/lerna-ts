import React from 'react';

import { content } from './styles.css';

const Content: React.FC<{}> = ({ children }) => {
    return (
        <div className={content}>
            {children}
        </div>
    );
};

export default Content;