import { call, select } from 'typed-redux-saga';

import { operation, Service, daemon, OperationService, injectable } from '@iiiristram/sagun';
import { getOperation } from '@project/common/selectors';
import { silentReplaceStrategy } from '@project/common/sagas/operation-strategies'

import { CartAPI } from '../../api/cart';
import { CART_OPERATION_ID } from '../../consts';
import { ProductID } from '../../types';

@injectable
export class CartService extends Service {
    private _api: CartAPI;

    constructor(operationsService: OperationService) {
        super(operationsService)
        this._api = new CartAPI();
    }

    toString() {
        return 'CartService'
    }

    @operation({
        id: CART_OPERATION_ID,
        ssr: true
    })
    public * loadCart() {
        return yield* call(this._api.getCart)
    }

    @daemon()
    @operation({
        id: CART_OPERATION_ID,
        updateStrategy: silentReplaceStrategy(CART_OPERATION_ID)
    })
    *addToCart(productId: ProductID) {
        const operation = yield* select(getOperation(CART_OPERATION_ID))

        return {
            ...operation?.result,
            [productId]: (operation?.result?.[productId] ?? 0) + 1
        }
    }

    @daemon()
    @operation({
        id: CART_OPERATION_ID,
        updateStrategy: silentReplaceStrategy(CART_OPERATION_ID)
    })
    *removeFromCart(productId: ProductID) {
        const operation = yield* select(getOperation(CART_OPERATION_ID))

        return {
            ...operation?.result,
            [productId]: (operation?.result?.[productId] ?? 0) - 1
        }
    }
}