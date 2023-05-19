import React from 'react';
import { useSelector } from 'react-redux';
import { hot } from 'react-hot-loader/root';

import { square } from '@project/common/utils';
import { CommonState } from '@project/common/infrastructure/reducers';
import { Loader } from '@project/common/components/loader';
import { load } from '@project/tools/code-splitting/load';

import styles from './styles.css';

const HelloAsync = load({
    import: () => import('@project/common/components/hello'),
    Renderer: ({ Component: Hello, children }) => (Hello ? <Hello>{children}</Hello> : <Loader />),
});

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

export default hot(HomePage);
