import React from 'react';
import { call } from 'typed-redux-saga';

import { useOperation, withSaga } from '@iiiristram/sagun';

import { TestService, userOperationId } from '../TestService';

type Props = { children?: React.ReactNode; id: string };

export default withSaga({
    sagaFactory: ({ getService }) => ({
        onLoad: function* (id: string) {
            const service = getService(TestService);
            yield* call(service.getUser, id);
        },
    }),
    argsMapper: ({ id }: Props) => [id],
})(function UserInfo({ children, id }) {
    const { result: login } = useOperation({ operationId: userOperationId(id), suspense: true });

    return (
        <div>
            {login}
            {children}
        </div>
    );
});
