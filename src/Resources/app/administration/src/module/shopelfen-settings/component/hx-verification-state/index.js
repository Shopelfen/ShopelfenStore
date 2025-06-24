import template from './hx-verification-state.html.twig';

const { Component, Mixin } = Shopware;

Component.register('hx-verification-state', {
    template,

    inject: {
        systemConfigApiService: 'systemConfigApiService',
        hxApiService: 'hxApi'
    },

    mixins: [
        Mixin.getByName('notification'),
    ],

    data() {
        return {
            isLoading: false,
            isVerified: false,
            verificationText: 'Du bist noch nicht authentifiziert.'
        }
    },

    created() {
        this.isLoading = true;
        this.systemConfigApiService.getValues('ShopelfenStore.config').then((response) => {
            console.log("Setting verification state from system config response:", response);
            this.isVerified = response['ShopelfenStore.config.verification'] || false;

            if (this.isVerified) {
                this.verificationText = "Du bist Authentifiziert!";
            }
        });
        this.isLoading = false;
    },


    methods: {

        base64ToArrayBuffer(base64) {
            const binaryString = window.atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        },

        arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        },

        async verify() {
            this.isLoading = true;

            let response = await this.systemConfigApiService.getValues('ShopelfenStore.config');

            let singleToken = response['ShopelfenStore.config.myConfigKey'] || '';
            let customerNumber = response['ShopelfenStore.config.customerNumber'] || '';
            let storeNumber = response['ShopelfenStore.config.storeNumber'] || '';

            if(singleToken === '' || customerNumber === '' || storeNumber === '') {
                this.verificationText = 'Bitte fülle alle Felder aus';
                this.isVerified = false;
                this.isLoading = false;
                this.createNotificationError({
                    title: 'Error',
                    message: 'Bitte fülle alle Felder aus!'
                });
                return;
            }

            this.hxApiService.verify(storeNumber, singleToken)
                .then(result => {
                    console.log("Result from service: ", result);
                    if(result.type === "success"){
                        this.isVerified = true;
                        this.verificationText = "Du bist Authentifiziert!";
                        const values = {
                            'ShopelfenStore.config.verification': this.isVerified,
                        };

                        this.systemConfigApiService.saveValues(values, null).then(() => {

                            this.createNotificationSuccess({
                                title: 'Erfolg',
                                message: 'Du wurdest authentifiziert!'
                            });
                            this.isLoading = false;
                        });
                    }
                })
                .catch(error => {
                    console.log("Error during verification:", error);
                    this.isLoading = false;
                    this.isVerified = false;
                    this.verificationText = 'Fehler bei der Authentifizierung';
                    this.createNotificationError({
                        title: 'Fehler',
                        message: 'Fehler bei der Authentifizierung: ' + error.message
                    });
                });
        }
    }
})
