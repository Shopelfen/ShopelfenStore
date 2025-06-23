import './page/config';
import './component/hx-verification-state';

import deDE from './snippet/de-DE.json';
import enGB from "./snippet/en-GB.json";
const { Module } = Shopware;

Module.register('shopelfen-settings', {
    type: 'plugin',
    name: 'ShopelfenSettings',
    title: 'shopelfen-settings.title',
    description: 'shopelfen-settings.description',
    color: '#ff3d58',
    icon: 'default-shopping-paper-bag',

    snippets: {
        'de-DE': deDE,
        'en-GB': enGB
    },

    routes: {
        index: {
            component: 'shopelfen-settings-index',
            path: 'index'
        }
    },


    settingsItem: {
        group: "plugins",
        to: 'shopelfen.settings.index',
        icon: 'regular-flow',
        label: "Shopelfen Einstellungen"
    }
});