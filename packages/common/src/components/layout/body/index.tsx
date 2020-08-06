import React from 'react';

import { body } from './styles.css';

const Body: React.FC<{}> = ({ children }) => {
    return <div className={body}>{children}</div>;
};

export default Body;
