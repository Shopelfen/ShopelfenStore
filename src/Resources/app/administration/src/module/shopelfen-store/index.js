// <plugin root>/src/Resources/app/administration/src/module/swag-example/index.js
import './page/overview';
import './page/config';
import './page/index';
import './page/listing';
import './page/license';
import './component/licence-card';
import './component/license-controls';

import deDE from './snippet/de-DE';
import enGB from './snippet/en-GB';

Shopware.Module.register('shopelfen-store', {
    type: 'plugin',
    name: 'Shopelfen Store',
    title: 'shopelfen-store.general.mainMenuItemGeneral',
    description: 'shopelfen-store.general.descriptionTextModule',
    color: '#39a94f',
    icon: 'default-shopping-paper-bag-product',

    snippets: {
        'de-DE': deDE,
        'en-GB': enGB
    },
    
    routes: {
        'my-extensions': {
            path: 'my-extensions',
            component: 'shopelfen-store-index',
            redirect: { name: 'shopelfen.store.my-extensions.listing' },
            meta: { privilege: 'system.plugin_maintain' },
            children: {
                listing: {
                    path: 'listing',
                    component: 'shopelfen-store-listing',
                    redirect: { name: 'shopelfen.store.my-extensions.listing.license' },
                    children: {
                        config: { path: 'config',  component: 'shopelfen-store-config', },
                        overview: { path: 'overview',  component: 'shopelfen-store-overview', },
                        license: { path: 'license',  component: 'shopelfen-store-license', }
                    }
                },
            }
        },
    },

    navigation: [{
        label: 'shopelfen-store.general.mainMenuItemGeneral',
        color: '#39a94f',
        path: 'shopelfen.store.my-extensions.listing',
        icon: 'default-shopping-paper-bag-product',
        parent: 'sw-extension',
        position: 100
    }]
});
