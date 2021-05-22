import React from 'react';

import { content, inner } from './styles.css';

const Content: React.FC<{}> = ({ children }) => {
    return (
        <div className={content}>
            <div className={inner}>
                {children}
            </div>
        </div>
    );
};

export default Content;
