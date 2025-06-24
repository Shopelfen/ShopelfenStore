import template from './config.html.twig';

const { Component } = Shopware;

Component.register('shopelfen-store-config', {
    template,

    created() {
        const currentDomain = window.location.origin;
        console.log('Aktuelle Domain:', currentDomain);
    }
});