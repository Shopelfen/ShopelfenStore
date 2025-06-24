import template from './license.html.twig';
import './license.scss';
import testImage from './plugin.png';

const { Component, Mixin } = Shopware;

Component.register('shopelfen-store-license', {
    template,

    inject: {
        systemConfigApiService: 'systemConfigApiService',
        hxApiService: 'hxApi'
    },

    mixins: [
        Mixin.getByName('notification')
    ],

    data() {
        return {
            plugins: [],
            filteredPlugins: [],
            filterByActive: false,
            isLoading: true,
            selectedSortingOption: 'updated-at',
        }
    },

    computed: {
        extensionRepository() {
            const repositoryFactory = Shopware.Service('repositoryFactory');
            return repositoryFactory.create('plugin');
        }
    },

    created() {
        this.loadPlugins();
    },


    methods: {

        async updateFilteredPlugins() {
            if(this.filterByActive) {
                const filtered = [];

                for(const plugin of this.plugins) {

                    if(plugin.active) {
                        filtered.push(plugin);
                    }
                }

                this.filteredPlugins = filtered;
            } else {
                this.filteredPlugins = this.plugins;
            }
        },

        async checkIfInstalled(title) {
            if(title == null) {
                this.createNotificationError({
                    title: "Unknown Name",
                    message: "Diese Extension hat keinen Namen. Bitte kontaktieren Sie den Entwickler."
                })
                return false;
            }

            const criteria = new Shopware.Data.Criteria();
            criteria.addFilter(Shopware.Data.Criteria.equals('name', title));

            try {
                const result = await this.extensionRepository.search(criteria, Shopware.Context.api);
                if(result.total !== 0) {
                    let plugin = result.getAt(0);
                    return (plugin.installedAt !== null);
                }else{
                    return false
                }

            } catch (error) {
                this.createNotificationError({
                    title: "Error while searching for product",
                    message: error
                })
                return true;
            }

        },

        async loadPlugins() {

            this.isLoading = true;

            this.plugins = [];

            let response = await this.systemConfigApiService.getValues('ShopelfenStore.config');

            console.log(response);

            let verified = response['ShopelfenStore.config.verification'] || false;

            if(verified){
                let key = response['ShopelfenStore.config.myConfigKey'] || '';
                let storeNumber = response['ShopelfenStore.config.storeNumber'] || '';
                await this.fetchPlugins(key, storeNumber);
            }

            await this.updateFilteredPlugins();
            this.filterByActive = false;
            this.isLoading = false;

        },

        async fetchPlugins(key, storeNumber) {
            this.hxApiService.fetchPlugins(storeNumber, key)
                .then(result => {
                    if(result.type === "success"){
                        let data = result.data || [];
                        for (const item of data) {
                            if (item.version !== 'invalid') {
                                const plugin = {
                                    title: item.title,
                                    manufacturer: item.author,
                                    technicalName: item.technicalName,
                                    id: item.id,
                                    image: item.hasImage
                                        ? `https://my.shopelfen.de/extension-api/extension-image/${item.id}`
                                        : testImage,
                                    active: item.active,
                                    validUntil: item.validUntil,
                                };
                                this.plugins.push(plugin);
                            }
                        }
                    }
                })
                .catch(error => {
                    this.createNotificationError({
                        title: 'Fehler',
                        message: error.message || 'Fehler beim Abrufen der Lizenzen'
                    });
                });
        },

        filter(value) {
            this.filterByActive = !this.filterByActive;
            console.log("Setting filter state to: ", value);
            this.updateFilteredPlugins();
        },

        changeSortingOption(value) {
            console.log("Set to:",  value);
            this.selectedSortingOption = value;
        },
    }
});
