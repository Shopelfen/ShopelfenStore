import template from './index.html.twig';

const { Component } = Shopware;

Component.register('shopelfen-store-index', {
    template,

    /*
    created() {
        // Falls jemand direkt auf 'shopelfen.store.index' landet, automatisch weiterleiten auf 'overview'
        if (this.$route.name === 'shopelfen.store.index') {
            this.$router.replace({ name: 'shopelfen.store.overview' });
        }
    },
     */
});