import { BaseAPI } from '../BaseAPI';
import { Cart } from './types';

const CART: Cart = {
    ['0']: 1,
    ['4']: 1
}

export class CartAPI extends BaseAPI {
    getCart = async () => {
        return this.mockRequest(CART);
    }
}