import template from './config.html.twig';


const { Component, Mixin } = Shopware;

Component.register('shopelfen-settings-index', {
    template,

    inject: ['systemConfigApiService'],

    mixins: [
        Mixin.getByName('notification'),
    ],

    data() {
        return {
            singleToken: '',
            customerNumber: '',
            storeNumber: '',
            isLoading: false,
        };
    },

    created() {
        this.loadConfig();
    },

    methods: {

        saveSingleToken(newValue) {
            this.singleToken = newValue;
        },

        saveCustomerNumber(newValue) {
            this.customerNumber = newValue;
        },
        saveStoreNumber(newValue) {
            this.storeNumber = newValue;
        },

        loadConfig() {
            // z.B. Konfiguration aus SystemConfig laden
            this.systemConfigApiService.getValues('ShopelfenStore.config').then((response) => {
                console.log(response);
                this.singleToken = response['ShopelfenStore.config.myConfigKey'] || '';
                this.customerNumber = response['ShopelfenStore.config.customerNumber'] || '';
                this.storeNumber = response['ShopelfenStore.config.storeNumber'] || '';

            });
        },

        saveConfig() {

            this.isLoading = true;

            const values = {
                'ShopelfenStore.config.myConfigKey': this.singleToken,
                'ShopelfenStore.config.customerNumber' : this.customerNumber,
                'ShopelfenStore.config.storeNumber' : this.storeNumber
            };

            this.systemConfigApiService.saveValues(values, null).then(() => {
                this.createNotificationSuccess({
                    title: 'Erfolg',
                    message: 'Werte wurden gespeichert!'
                });
            });

            this.isLoading = false;
        }
    }
});