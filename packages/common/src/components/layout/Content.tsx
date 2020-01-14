import React from 'react';

const style: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    padding: 20
}

const Content: React.FC<{}> = ({ children }) => {
    return (
        <div style={style}>
            {children}
        </div>
    );
};

export default Content;