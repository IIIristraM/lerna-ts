import { CommonState } from '@project/common/infrastructure/store';
import { getOperation } from '@project/common/selectors';

import { Product } from './api/products';
import { CART_OPERATION_ID, PRODUCTS_OPERATION_ID } from './consts';
import { Cart } from './types';

export const cartOperationSelector = getOperation(CART_OPERATION_ID);
export const productsOperationSelector = getOperation(PRODUCTS_OPERATION_ID);

export const cartSelector = (cart?: Cart, products?: Product[]) =>
    Object
        .entries(cart || {})
        .reduce((prev, current) => {
            const [id, count] = current;
            const product = products?.find(p => p.id === id);

            if (product && count) {
                prev.push({ product, count });
            }

            return prev;
        }, [] as Array<{ product: Product, count: number }>)


export const cartPriceSelector = (state: CommonState) =>
    cartSelector(cartOperationSelector(state)?.result, productsOperationSelector(state)?.result)
        .reduce((prev, current) => {
            const { count, product: { price } } = current;
            return prev += (price || 0) * count;
        }, 0)