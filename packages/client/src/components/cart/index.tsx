import React, { 
    memo,
    Suspense
} from 'react';
import { useSelector } from 'react-redux';
import { DisableSsrContext, useOperation, useSaga, useServiceConsumer } from '@iiiristram/sagun';

import { formatPrice } from '@project/common/utils';
import { LayoutService } from '@project/common/sagas/services/LayoutService';
import mixins from '@project/common/styles/mixins.css';

import { cartPriceSelector } from '../../selectors';
import { CART_OPERATION_ID } from '../../consts';

import styles from './styles.css';

const Total = memo(() => {
    useOperation({ operationId: CART_OPERATION_ID, suspense: true });

    const totalPrice = useSelector(cartPriceSelector);

    console.log("Render Total")

    return (
        <>
            <span className={styles.title}>Cart:</span>
            <span className={styles.price}>{formatPrice(totalPrice)}</span>
        </>
    );
});

export const Cart = () => {
    const service = useServiceConsumer(LayoutService);

    console.log("Render Cart")

    return (
        <div className={[styles.cart, mixins.primary].join(' ')} onClick={() => service.actions.toggleRightSidebar()}>
            {/* <Suspense fallback={<Loader size="small" />}> */}
                <Total />
            {/* </Suspense> */}
        </div>
    );
};
