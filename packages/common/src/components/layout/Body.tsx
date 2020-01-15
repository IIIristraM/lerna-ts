import React from 'react';

const style: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh'
}

const Body: React.FC<{}> = ({ children }) => {
    return (
        <div style={style}>
            {children}
        </div>
    );
};

export default Body;