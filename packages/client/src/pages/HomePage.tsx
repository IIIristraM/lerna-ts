import React from 'react';
import { useSelector } from 'react-redux';

import { Hello } from '@project/common/components/hello';
import { square } from '@project/common/utils';
import { CommonState } from '@project/common/infrastructure/reducers';

const HomePage: React.FC<{}> = () => {
    const login = useSelector((state: CommonState) => state.user)?.login;

    return (
        <Hello>
            {login}_{square(7)}
        </Hello>
    );
};

export default HomePage;
