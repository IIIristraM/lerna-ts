import { BaseAPI } from '../BaseAPI';
import { Product } from './types';

const PRODUCTS: Product[] = Array(100).fill(0).map((_, i) => ({
    id: `${i}`,
    name: `Product ${i + 1}`,
    description: `It's the best product on the market. If you find better, contact us.`,
    price: (i + 1) * 100
}))

export class ProductsAPI extends BaseAPI {
    getProductsList = async () => {
        return this.mockRequest(PRODUCTS);
    }
}