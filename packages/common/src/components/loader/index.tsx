import React from 'react';

import styles from './styles.css';
import mixins from '../../styles/mixins.css';

type Props = {
    align?: 'center';
    style?: React.CSSProperties;
    size?: 'small';
};

export function Loader({ align = 'center', style, size }: Props) {
    return (
        <div
            style={style}
            className={[
                styles.loader,
                align === 'center' ? mixins.centered : undefined,
                size === 'small' ? styles.small : undefined,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            Loading...
        </div>
    );
}

const PRIMARY_STYLE = { color: 'dodgerblue' };

export const PrimaryLoader = () => <Loader style={PRIMARY_STYLE} />;
