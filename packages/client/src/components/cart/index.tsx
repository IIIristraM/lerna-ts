import React, { memo, Suspense } from 'react';
import { useSelector } from 'react-redux';

import { formatPrice } from '@project/common/utils';
import { useOperation, useServiceConsumer } from '@iiiristram/sagun';
import { LayoutService } from '@project/common/sagas/services/LayoutService';
import { Loader } from '@project/common/components/loader';

import mixins from '@project/common/styles/mixins.css';
import styles from './styles.css';
import { cartPriceSelector } from '../../selectors';
import { CART_OPERATION_ID } from '../../consts';

const Total = memo(() => {
    useOperation({ operationId: CART_OPERATION_ID, suspense: true });

    const totalPrice = useSelector(cartPriceSelector);

    return (
        <>
            <span className={styles.title}>Cart:</span>
            <span className={styles.price}>{formatPrice(totalPrice)}</span>
        </>
    );
});

export const Cart = () => {
    const service = useServiceConsumer(LayoutService);

    return (
        <div className={[styles.cart, mixins.primary].join(' ')} onClick={() => service.actions.toggleRightSidebar()}>
            <Suspense fallback={<Loader size="small" />}>
                <Total />
            </Suspense>
        </div>
    );
};
