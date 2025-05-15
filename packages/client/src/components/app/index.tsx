import React, { Suspense } from 'react';
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
import { WatchService } from '../../sagas/services/WatchService';
import { UserService } from '../../sagas/services/UserService';
import { User } from '../user';

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
    id: "app-init",
    onLoad: function* () {
        const cartService = getService(CartService);
        const layoutService = getService(LayoutService);
        const productsService = getService(ProductsService);
        const watchService = getService(WatchService);

        yield* call(productsService.run);
        yield* call(cartService.run);
        yield* call(layoutService.run);
        yield* call(watchService.run);

        yield* all([
            call(productsService.loadProducts),
            call(cartService.loadCart)
        ])
    }
})

const App = () => {
    const di = useDI();

    di.registerService(di.createService(CartService));
    di.registerService(di.createService(LayoutService));
    di.registerService(di.createService(ProductsService));
    di.registerService(di.createService(WatchService));
    di.registerService(di.createService(UserService));

    useSaga(appSagaFactory(di));

    console.log("Render App")

    return (
        <Body>
            <Header>
                <User />
                <Navigation>
                    {ROUTES.map(({ url, text }, i) => (
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

export default () => (
    <DisableSsrContext.Provider value={false}>
        <Suspense fallback={<PrimaryLoader />}>
            <App />
        </Suspense>
    </DisableSsrContext.Provider>
);
