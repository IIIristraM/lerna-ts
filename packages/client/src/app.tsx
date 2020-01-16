import React from 'react';
import { Switch, Route } from 'react-router';
import { Link } from 'react-router-dom';

import { Header, Content, Body } from '@project/common/components/layout';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';

const ROUTES = [
    { url: '/', page: HomePage, text: 'Home' },
    { url: '/contacts', page: ContactsPage, text: 'Contacts' },
    { url: '/about', page: AboutPage, text: 'About' },
]

const LINK_STYLE: React.CSSProperties = {
    marginRight: 15,
    color: 'black',
    textTransform: 'uppercase'
}

const App: React.FC<{}> = () => (
    <Body>
        <Header>
            {ROUTES.map(({ url, text }) => (
                <Link key={url} to={url} style={LINK_STYLE}>{text}</Link>
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
)

export default App;
