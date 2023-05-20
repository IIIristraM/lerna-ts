import { AsyncOperation, OperationId } from '@iiiristram/sagun';

import { CommonState } from './infrastructure/store';

export const getOperation = <TRes, TArgs extends any[]>(operationId: OperationId<TRes, TArgs>) => (
    state: CommonState,
) => state.asyncOperations.get(operationId) as AsyncOperation<TRes, TArgs> | undefined;
