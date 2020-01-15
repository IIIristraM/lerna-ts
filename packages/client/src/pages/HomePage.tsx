import React from 'react';
import { Hello } from "@project/common/components/hello";
import { square } from "@project/common/utils";

const HomePage: React.FC<{}> = () => (
    <Hello>{square(7)}</Hello>
)

export default HomePage;