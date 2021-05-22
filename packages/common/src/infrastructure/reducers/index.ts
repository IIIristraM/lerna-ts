import { combineReducers } from 'redux';

import { asyncOperationsReducer } from '@iiiristram/sagun';

const rootReducer = combineReducers({
    asyncOperations: asyncOperationsReducer,
});

export type CommonState = ReturnType<typeof rootReducer>;

export default rootReducer;
