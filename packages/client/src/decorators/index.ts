import { call } from 'typed-redux-saga';
import { DaemonMode, Service, daemon, OperationId, Action, AsyncOperation } from '@iiiristram/sagun';

import { store } from '../store';

export function watch<TRes>(operationId: OperationId<TRes>) {
    return function wrapper(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
        const origin = descriptor.value;
        let prevValue = store.getState().asyncOperations.get(operationId)?.result as TRes | undefined;

        descriptor.value = function * (this: Service, operation: AsyncOperation<TRes>) {
            if (prevValue === operation.result) return;
            yield* call([this, origin], operation)
            prevValue = operation.result
        }

        return daemon(DaemonMode.Last, (action: Action<any>) => {
            return action.type === "@sagun/ADD_OR_UPDATE_OPERATION" && action.payload.id === operationId
        })(target, key, descriptor);
    };
}