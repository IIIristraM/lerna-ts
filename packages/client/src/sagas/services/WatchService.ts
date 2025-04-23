import { Service, OperationId, AsyncOperation } from '@iiiristram/sagun';

import { CART_OPERATION_ID } from '../../consts';
import { watch } from '../../decorators';

type Cart = typeof CART_OPERATION_ID extends OperationId<infer R> ? R : never;

export class WatchService extends Service {
    toString() {
        return 'WatchService';
    }

    @watch(CART_OPERATION_ID)
    *watchCart(operation: AsyncOperation<Cart>) {
        console.log("Cart changed", operation?.result)
    }
}