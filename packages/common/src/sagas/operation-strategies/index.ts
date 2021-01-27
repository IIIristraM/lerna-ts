import { select } from 'typed-redux-saga';

import { AsyncOperation, Gen, OperationId } from '@iiiristram/sagun';

import { getOperation } from '../../selectors';

export const silentReplaceStrategy = <TRes, TArgs extends any[]>(operationId: OperationId<TRes, TArgs>) =>
    function* silentReplaceStrategy(
        operation: AsyncOperation<TRes, TArgs>
    ): Gen<AsyncOperation<TRes, TArgs>> {
        if (operation.isLoading) {
            const currentOperation = yield* select(getOperation(operation.id))
            return {
                ...currentOperation!,
                isLoading: false
            }
        }

        return operation;
    }
