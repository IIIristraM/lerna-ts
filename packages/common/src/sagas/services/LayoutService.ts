import { call, select } from 'typed-redux-saga';

import { operation, OperationFromId, Service, daemon } from '@iiiristram/sagun';
import { silentReplaceStrategy } from '../operation-strategies'

import { LayoutModel } from '../../types';
import { LAYOUT_OPERATION_ID } from '../../consts';
import { getOperation } from '../../selectors';

const DEFAULT_LAYOUT_STATE: LayoutModel = {
    rightSide: false
}

function* layoutUpdateStrategy(operation: OperationFromId<typeof LAYOUT_OPERATION_ID>) {
    return yield* call(silentReplaceStrategy(LAYOUT_OPERATION_ID), {
        ...operation,
        result: {
            ...DEFAULT_LAYOUT_STATE,
            ...operation?.result
        }
    })
}

export class LayoutService extends Service {
    toString() {
        return 'LayoutService';
    }

    @operation({
        id: LAYOUT_OPERATION_ID,
        updateStrategy: layoutUpdateStrategy
    })
    private * updateLayout(patch: Partial<LayoutModel>) {
        return patch
    }

    @daemon()
    public * toggleRightSidebar(open?: boolean) {
        const operation = yield* select(getOperation(LAYOUT_OPERATION_ID))

        yield* call(this.updateLayout, {
            rightSide: open ?? !operation?.result?.rightSide
        })
    }
}