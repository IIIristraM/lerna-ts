import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useOperation } from '@iiiristram/sagun';

import { Card, CardBody, CardDescription, CardImage, CardTitle } from '@project/common/components/card';
import { formatPrice } from '@project/common/utils';
import mixins from '@project/common/styles/mixins.css';

import { cartPriceSelector, cartSelector } from '../../selectors';
import { CART_OPERATION_ID, PRODUCTS_OPERATION_ID } from '../../consts';

import styles from './styles.css';

const Empty = () => <span className={mixins.centered}>Your cart is empty</span>;

const Total = () => {
    const price = useSelector(cartPriceSelector);

    console.log("Render CartDetailsTotal")

    return (
        <div className={styles.total}>
            <h3>Total: {formatPrice(price)}</h3>
        </div>
    );
};

export const CartDetails = function CartDetails() {
    const {result: cart} = useOperation({ operationId: CART_OPERATION_ID, suspense: true });
    const {result: products} = useOperation({ operationId: PRODUCTS_OPERATION_ID, suspense: true });
    
    const data = useMemo(() => cartSelector(cart, products), [cart, products]);

    console.log("Render CartDetails")

    if (!data.length) {
        return <Empty />;
    }

    return (
        <div>
            {data.map(({ product: { id, name, price }, count }) => (
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
