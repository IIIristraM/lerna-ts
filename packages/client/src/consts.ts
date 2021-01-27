import { OperationId } from '@iiiristram/sagun';

import { Cart, Product } from './types';

export const PRODUCTS_OPERATION_ID = 'PRODUCTS_OPERATION_ID' as OperationId<Product[], []>
export const CART_OPERATION_ID = 'CART_OPERATION_ID' as OperationId<Cart, any[]>