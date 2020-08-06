import React from 'react';
import { Switch, Route } from 'react-router';
import { hot } from 'react-hot-loader/root';

import { Header, Content, Body } from '@project/common/components/layout';
import Link from '@project/common/components/link';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';

const ROUTES = [
    { url: '/', page: HomePage, text: 'Home' },
    { url: '/contacts', page: ContactsPage, text: 'Contacts' },
    { url: '/about', page: AboutPage, text: 'About' },
];

const App: React.FC<{}> = () => (
    <Body>
        <Header>
            {ROUTES.map(({ url, text }) => (
                <Link key={url} to={url}>
                    {text}
                </Link>
            ))}
        </Header>
        <Content>
            <Switch>
                {ROUTES.map(({ url, page }) => (
                    <Route key={url} path={url} component={page} exact />
                ))}
            </Switch>
        </Content>
    </Body>
);

export default hot(App);
