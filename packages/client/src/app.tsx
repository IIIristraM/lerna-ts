import React from 'react';
import { Switch, Route } from 'react-router';
import { hot } from 'react-hot-loader/root';

import { Header, Content, Body } from '@project/common/components/layout';
import Link from '@project/common/components/link';
import { load } from '@project/tools/code-splitting/load';
import { Loader } from '@project/common/components/loader';

import AboutPage from './pages/AboutPage';

// TODO hmr doesn't work for async components
const HomePageAsync = load(() => import('./pages/home-page'));
const ContactsPageAsync = load({
    import: () => import(/* webpackChunkName: "ContactsPage" */ './pages/ContactsPage'),
    Loader,
});

const ROUTES = [
    { url: '/', page: HomePageAsync, text: 'Home' },
    { url: '/contacts', page: ContactsPageAsync, text: 'Contacts' },
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
