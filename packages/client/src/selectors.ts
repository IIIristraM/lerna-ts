import { CommonState } from '@project/common/infrastructure/store';
import { getOperation } from '@project/common/selectors';
import { Product } from './api/products';

import { CART_OPERATION_ID, PRODUCTS_OPERATION_ID } from './consts';
import { ProductID } from './types';

export const cartOperationSelector = getOperation(CART_OPERATION_ID);
export const productsOperationSelector = getOperation(PRODUCTS_OPERATION_ID);

const productById = (id: ProductID) => (state: CommonState) =>
    productsOperationSelector(state)?.result?.find(p => p.id === id)

export const cartSelector = (state: CommonState) =>
    Object
        .entries(cartOperationSelector(state)?.result || {})
        .reduce((prev, current) => {
            const [id, count] = current;
            const product = productById(id)(state);

            if (product && count) {
                prev.push({ product, count });
            }

            return prev;
        }, [] as Array<{ product: Product, count: number }>)


export const cartPriceSelector = (state: CommonState) =>
    cartSelector(state)
        .reduce((prev, current) => {
            const { count, product: { price } } = current;
            return prev += (price || 0) * count;
        }, 0)