import React from 'react';
import { Switch, Route } from 'react-router';
import { hot } from 'react-hot-loader/root';
import { call, all } from 'typed-redux-saga';

import { Header, Body } from '@project/common/components/layout';
import Link from '@project/common/components/link';
import { load } from '@project/tools/code-splitting/load';
import { PrimaryLoader } from '@project/common/components/loader';
import { DisableSsrContext, IDIContext, useDI, useSaga } from '@iiiristram/sagun';
import { LayoutService } from '@project/common/sagas/services/LayoutService'

import { CartService } from '../../sagas/services/CartService';
import { Cart } from '../cart';
import { Navigation } from '../navigation';
import { ProductsService } from '../../sagas/services/ProductService';

const HomePageAsync = load({
    import: () => import(/* webpackChunkName: "HomePage" */ '../home-page'),
    Loader: PrimaryLoader,
});

const ContactsPageAsync = load({
    import: () => import(/* webpackChunkName: "ContactsPage" */ '../ContactsPage'),
    Loader: PrimaryLoader,
});

const AboutPageAsync = load({
    import: () => import(/* webpackChunkName: "AboutPage" */ '../AboutPage'),
    Loader: PrimaryLoader,
});

const ROUTES = [
    { url: '/', page: HomePageAsync, text: 'Home' },
    { url: '/contacts', page: ContactsPageAsync, text: 'Contacts' },
    { url: '/about', page: AboutPageAsync, text: 'About' },
];

const appSagaFactory = ({ getService }: IDIContext) => ({
    onLoad: function* () {
        const cartService = getService(CartService);
        const layoutService = getService(LayoutService);
        const productsService = getService(ProductsService);

        yield* call(productsService.run);
        yield* call(cartService.run);
        yield* call(layoutService.run);

        yield* all([
            call(productsService.loadProducts),
            call(cartService.loadCart),
        ])
    }
})

const App = () => {
    const di = useDI();

    di.registerService(di.createService(CartService));
    di.registerService(di.createService(LayoutService));
    di.registerService(di.createService(ProductsService));

    useSaga(appSagaFactory(di));

    return (
        <Body>
            <Header>
                <Navigation>
                    {ROUTES.map(({ url, text }) => (
                        <Link key={url} to={url}>
                            {text}
                        </Link>
                    ))}
                </Navigation>
                <Cart />
            </Header>
            <Switch>
                {ROUTES.map(({ url, page }) => (
                    <Route key={url} path={url} component={page} exact />
                ))}
            </Switch>
        </Body>
    );
};

export default hot(() => (
    <DisableSsrContext.Provider value={false}>
        <App />
    </DisableSsrContext.Provider>
));
