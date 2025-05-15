import React, { 
    memo,
    Suspense
} from 'react';

import { DisableSsrContext, getId, useOperation, useSaga, useServiceConsumer } from '@iiiristram/sagun';
import { call } from 'typed-redux-saga';
import { Loader } from '@project/common/components/loader';

import mixins from '@project/common/styles/mixins.css';

import styles from './styles.css';
import { UserService } from '../../sagas/services/UserService';


const UserName = memo(function UserName() {
    const {service} = useServiceConsumer(UserService);

    useSaga({
        id: "user",
        onLoad: function* () {
            yield* call(service.run)
            return yield* call(service.getUserInfo)
        },
        onDispose: function* () {
            yield* call(service.destroy)
        }
    });

    const {result} = useOperation({ operationId: getId(service.getUserInfo), suspense: true })

    return (
        <>
            {result?.login}
        </>
    );
});

export function User() {
    return (
        <div className={[styles.user, mixins.primary].join(' ')}>
            <DisableSsrContext.Provider value={true}>
                <Suspense fallback={<Loader size="small" />}>
                    <UserName />
                </Suspense>
            </DisableSsrContext.Provider>
        </div> 
    )
}
