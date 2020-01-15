import React from 'react';

const style: React.CSSProperties = {
    position: 'sticky',
    width: '100%',
    height: 60,
    boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    top: 0,
    backgroundColor: 'white'
}

const Header: React.FC<{}> = ({ children }) => {
    return (
        <div style={style}>
            {children}
        </div>
    );
};

export default Header;