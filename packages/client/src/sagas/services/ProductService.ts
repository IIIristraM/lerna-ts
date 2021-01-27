import { call } from 'typed-redux-saga';

import { injectable, operation, OperationService, Service } from '@iiiristram/sagun';

import { ProductsAPI } from '../../api/products';
import { PRODUCTS_OPERATION_ID } from '../../consts';

@injectable
export class ProductsService extends Service {
    _api: ProductsAPI

    constructor(
        operationsService: OperationService
    ) {
        super(operationsService)
        this._api = new ProductsAPI()
    }

    toString() {
        return 'ProductsService'
    }

    @operation({
        id: PRODUCTS_OPERATION_ID,
        ssr: true
    })
    *loadProducts() {
        return yield* call(this._api.getProductsList)
    }
}