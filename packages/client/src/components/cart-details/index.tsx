import React from 'react';
import { useSelector } from 'react-redux';

import { Card, CardBody, CardDescription, CardImage, CardTitle } from '@project/common/components/card';
import { formatPrice } from '@project/common/utils';

import { cartPriceSelector, cartSelector } from '../../selectors';

import mixins from '@project/common/styles/mixins.css';
import styles from './styles.css';

const Empty = () => <span className={mixins.centered}>Your cart is empty</span>;

const Total = () => {
    const price = useSelector(cartPriceSelector);

    return (
        <div className={styles.total}>
            <h3>Total: {formatPrice(price)}</h3>
        </div>
    );
};

export const CartDetails = () => {
    const cart = useSelector(cartSelector);

    if (!cart.length) {
        return <Empty />;
    }

    return (
        <div>
            {cart.map(({ product: { id, name, price }, count }) => (
                <Card key={id} theme="list">
                    <CardImage />
                    <CardBody>
                        <CardTitle>{name}</CardTitle>
                        <CardDescription>{formatPrice(price * count)}</CardDescription>
                    </CardBody>
                </Card>
            ))}
            <Total />
        </div>
    );
};
