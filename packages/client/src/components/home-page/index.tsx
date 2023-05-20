import React, { memo, Suspense, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useOperation, useServiceConsumer } from '@iiiristram/sagun';
import { CommonState } from '@project/common/infrastructure/store';
import { formatPrice } from '@project/common/utils';
import { Content, ContentSwitcher, RightSidebar } from '@project/common/components/layout';
import {
    Card,
    CardActions,
    CardBody,
    CardDescription,
    CardFooter,
    CardImage,
    CardTitle,
} from '@project/common/components/card';
import { PrimaryLoader } from '@project/common/components/loader';

import { Product, ProductID } from '../../api/products';
import { CartService } from '../../sagas/services/CartService';
import { cartOperationSelector } from '../../selectors';
import { CartDetails } from '../cart-details';
import { CART_OPERATION_ID, PRODUCTS_OPERATION_ID } from '../../consts';

import mixins from '@project/common/styles/mixins.css';
import styles from './styles.css';

const Button: React.FC<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> = ({
    children,
    className,
    ...rest
}) => (
    <button className={[styles.button, className].join(' ')} {...rest}>
        {children}
    </button>
);

const inCartSelector = (id: ProductID) => (state: CommonState) => !!cartOperationSelector(state)?.result?.[id];

const ProductCard = memo<{ product: Product }>(({ product: { id, name, description, price } }) => {
    const { actions } = useServiceConsumer(CartService);
    const inCart = useSelector(inCartSelector(id));

    const addToCart = useCallback(() => actions.addToCart(id), [id]);
    const removeFromCart = useCallback(() => actions.removeFromCart(id), [id]);

    return (
        <Card>
            <CardImage />
            <CardBody>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardBody>
            <CardFooter>
                <span>{formatPrice(price)}</span>
                <CardActions>
                    {inCart ? (
                        <Button className={mixins.primary} onClick={removeFromCart}>
                            Remove
                        </Button>
                    ) : (
                        <Button className={mixins.primary} onClick={addToCart}>
                            Add
                        </Button>
                    )}
                </CardActions>
            </CardFooter>
        </Card>
    );
});

const ProductsList = memo(() => {
    const operation = useOperation({ operationId: PRODUCTS_OPERATION_ID });

    return (
        <>
            {(operation?.result || []).map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </>
    );
});

const PageContent = memo(() => {
    useOperation({ operationId: PRODUCTS_OPERATION_ID, suspense: true });
    useOperation({ operationId: CART_OPERATION_ID, suspense: true });

    return (
        <ContentSwitcher>
            <Content>
                <div className={styles.list}>
                    <ProductsList />
                </div>
            </Content>
            <RightSidebar>
                <CartDetails />
            </RightSidebar>
        </ContentSwitcher>
    );
});

export default function HomePage() {
    return (
        <Suspense fallback={<PrimaryLoader />}>
            <PageContent />
        </Suspense>
    );
}
