import { call } from 'typed-redux-saga';

import { operation, Service, OperationService, inject } from '@iiiristram/sagun';

import { UserAPI } from '../../api/user';

export class UserService extends Service {
    private _api: UserAPI;

    constructor(@inject(OperationService) operationsService: OperationService) {
        super(operationsService);
        this._api = new UserAPI();
    }

    toString() {
        return 'UserService';
    }

    @operation({
        ssr: true,
    })
    public *getUserInfo() {
        const res = yield* call(this._api.getUserInfo)
        return res;
    }
}