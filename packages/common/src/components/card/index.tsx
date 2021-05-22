import React from 'react';

import * as styles from './styles.css';

type CardThemes = "default" | "list";

export const Card: React.FC<{ theme?: CardThemes }> = ({ children, theme = "default" }) => (
    <div className={[styles.card, styles[theme]].join(' ')}>
        {children}
    </div>
)

export const CardImage: React.FC = ({ children }) => (
    <div className={styles.cardImage}>{children}</div>
)

export const CardBody: React.FC = ({ children }) => (
    <div className={styles.cardBody}>{children}</div>
)

export const CardTitle: React.FC = ({ children }) => (
    <h3 className={styles.cardTitle}>{children}</h3>
)

export const CardDescription: React.FC = ({ children }) => (
    <p className={styles.cardDescription}>{children}</p>
)

export const CardFooter: React.FC = ({ children }) => (
    <div className={styles.cardFooter}>{children}</div>
)

export const CardActions: React.FC = ({ children }) => (
    <div className={styles.cardActions}>{children}</div>
)