import React from 'react';

import styles from './styles.css';

export function Navigation({ children }: React.PropsWithChildren<{}>) {
    return <div className={styles.navigation}>{children}</div>;
}
