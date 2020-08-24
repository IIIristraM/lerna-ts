import React from 'react';
import { useSelector } from 'react-redux';

import { square } from '@project/common/utils';
import { CommonState } from '@project/common/infrastructure/reducers';
import { load } from '@project/tools/code-splitting/load';

import styles from './styles.css';

const HelloAsync = load(() => import('@project/common/components/hello'));

const HomePage: React.FC<{}> = () => {
    const login = useSelector((state: CommonState) => state.user)?.login;

    return (
        <div className={styles.content}>
            <HelloAsync>
                {login}_{square(7)}
            </HelloAsync>
        </div>
    );
};

export default HomePage;
