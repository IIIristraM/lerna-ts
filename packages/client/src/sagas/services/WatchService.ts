import { DaemonMode, Service, daemon, OperationId, Action, AsyncOperation } from '@iiiristram/sagun';
import { call, select } from 'typed-redux-saga';

import { getOperation } from '@project/common/selectors';

import { CART_OPERATION_ID } from '../../consts';

type Cart = typeof CART_OPERATION_ID extends OperationId<infer R> ? R : never;

export class WatchService extends Service {
    #cartValue: Cart | undefined;

    toString() {
        return 'WatchService';
    }

    @daemon(DaemonMode.Every, (action: Action<any>) => {
        return action.type === "@sagun/ADD_OR_UPDATE_OPERATION" && action.payload.id === CART_OPERATION_ID
    })
    *watchCart(operation: AsyncOperation<Cart>) {
        if (this.#cartValue === operation.result) return;
        console.log("Cart changed", operation?.result)
        this.#cartValue = operation?.result;
    }

    *run() {
        yield call([this, super.run]);
        const operation = yield* select(getOperation(CART_OPERATION_ID));
        this.#cartValue = operation?.result;
    }
}