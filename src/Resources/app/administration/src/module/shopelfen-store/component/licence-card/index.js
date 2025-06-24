import template from './license-card.html.twig';
import './license-card.scss';

const { Component, Mixin } = Shopware;

Component.register('license-card', {
    template,

    inject: {
        systemConfigApiService: 'systemConfigApiService',
        hxApiService: 'hxApi',
        hxShopwareUtilityService: 'HxShopwareUtility'
    },

    mixins: [
        Mixin.getByName('notification')
    ],

    compatConfig: Shopware.compatConfig,

    props: {
        extensionId: {
            type: String,
            require: false,
            default: null
        },
        title: {
            type: String,
            require: false,
            default: null
        },
        technicalName: {
            type: String,
            required: false,
            default: null
        },
        manufacturer: {
            type: String,
            require: false,
            default: null
        },
        image: {
            type: String,
            require: false,
            default: null
        },
        active: {
            type: Boolean,
            require: false,
            default: false
        },
        validUntil: {
            type: String,
            require: false,
            default: null
        },
        type: {
            type: String,
            required: false,
            default: 'plugin' // plugin or app
        }
    },

    data() {
        return {
            isHidden: false,
            loadingActive: false,
            isActive: false,
            isLoadingUpdate: false,
            isUpdateAvailable: false,
            updateToVersion: null,
            isInstalled: false,
            isDownloaded: false,
            key: null,
            storeNumber: null,
            verified: false,
            version: "",
            composerName: ""
        }
    },

    computed:{
        formattedDate() {
            return this.validUntil ? this.validUntil : '--.--.----';
        },

        extensionRepository() {
            const repositoryFactory = Shopware.Service('repositoryFactory');
            return repositoryFactory.create('plugin');
        },

        deletable(){
            return this.isInstalled || this.isDownloaded;
        }
    },

    async mounted() {
        this.loadConfigValues().then(() => {
            this.generalCheck();
        });
    },

    methods: {
        async loadConfigValues() {
            this.loadingActive = true;
            try {
                const response = await this.systemConfigApiService.getValues('ShopelfenStore.config');
                this.key = response['ShopelfenStore.config.myConfigKey'] || '';
                this.storeNumber = response['ShopelfenStore.config.storeNumber'] || '';
                this.verified = response['ShopelfenStore.config.verification'] || false;
            } catch (e) {
                console.log("Error while loading config values", e);
            }
        },

        generalCheck(){
            this.hxApiService.checkFolderInstalled(this.technicalName, Shopware.Context.api.authToken.access)
                .then(response => {
                    if(response.total > 0){
                        let data = response.data[0];
                        this.isDownloaded = true;
                        console.log(data['installedAt']);
                        console.log("Setting Version to: " + data['version']);
                        this.version = data['version'];
                        if(data.installedAt !== undefined && data.installedAt !== null){
                            this.isInstalled = true;
                            if(data.active === true){
                                this.isActive = true;
                                this.version = data['version'];
                            }
                        }

                    }
                    this.checkForCustomUpdates(this.version);
                })
                .catch(error => {
                    console.log(error);
                    this.loadingActive = false;
                })
        },

        setHiddenState(value){
            this.isHidden = value;
            console.log("Setting hidden state to: " + value);
        },

        setActiveState(newState) {
            console.log("Setting active state to: " + newState);
            this.isActive = newState;
        },

        async requestDownload(){

            // herunterladen requesten und über php als zip ablegen lassen
            // abfragen ob die extension da liegt um state installieren zu setzen


            if(this.verified === false){
                this.createNotificationError({
                    title: 'Error',
                    message: 'Du bist noch nicht verifiziert.'
                });
                return;
            }

            this.hxApiService.installPluginInternally(this.technicalName, this.key, Shopware.Context.api.authToken.access, this.storeNumber, this.extensionId)
                .then(response => {

                    console.log(response);
                    if(response.type === "success"){
                        this.hxShopwareUtilityService.refreshPlugins(Shopware.Context.api.authToken.access)
                            .then(() => {
                                    this.reload();
                                })
                            .catch(() => {
                                this.createNotificationError({
                                    title: 'Error',
                                    message: 'Die Erweiterung konnte nicht heruntergeladen werden. Bitte versuche es später erneut.'
                                });
                            });
                    }
                })
                .catch(error => console.log(error))

        },

        async requestInstallation(){
            console.log("Installing plugin: " + this.title);
            this.install();
            this.createNotificationSuccess({
                title: this.$tc("shopelfen-store.extension.installation.title"),
                message: this.$tc("shopelfen-store.extension.installation.description", 0, {extension: this.title})
            });
        },

        async requestDeletion(){

            console.log(Shopware.Context.api.authToken.access);
            if(this.isInstalled){
                this.hxShopwareUtilityService.uninstallPlugin(Shopware.Context.api.authToken.access, this.technicalName)
                    .then(() => {
                        this.hxShopwareUtilityService.clearShopwareCache(Shopware.Context.api.authToken.access)
                            .then(() => {
                                this.reload();

                                this.createNotificationSuccess({
                                    title: this.$tc("shopelfen-store.extension.uninstall.title"),
                                    message: this.$tc("shopelfen-store.extension.uninstall.description", 0, {extension: this.title})
                                });
                            })
                            .catch(() => {
                                this.makeCacheError();
                            })
                    })
                    .catch(error => console.log(error));
            }else{
                this.hxShopwareUtilityService.removePlugin(Shopware.Context.api.authToken.access, this.technicalName)
                    .then(() => {
                        this.hxShopwareUtilityService.clearShopwareCache(Shopware.Context.api.authToken.access)
                            .then(() => {
                                this.reload();
                                this.createNotificationSuccess({
                                    title: this.$tc("shopelfen-store.extension.remove.title"),
                                    message: this.$tc("shopelfen-store.extension.remove.description", 0, {extension: this.title})
                                });
                            })
                            .catch(() => {
                                this.makeCacheError();
                            })
                    })
                    .catch(error => console.log(error));
            }
        },

        async checkIfInstalled() {
            if(this.title == null) {
                this.createNotificationError({
                    title: "Unknown Name",
                    message: "Diese Extension hat keinen Namen. Bitte kontaktieren Sie den Entwickler."
                })
                this.isInstalled = false;
            }

            const criteria = new Shopware.Data.Criteria();
            criteria.addFilter(Shopware.Data.Criteria.equals('name', this.title));

            try {
                const result = await this.extensionRepository.search(criteria, Shopware.Context.api);
                if(result.total !== 0) {
                    let plugin = result.getAt(0);
                    this.isInstalled = (plugin.installedAt !== null);
                    if (!this.isInstalled) {
                        this.isDownloaded = false;
                    }
                }else{
                    this.isInstalled = false;
                    this.isDownloaded = false;
                }

            } catch (error) {
                this.createNotificationError({
                    title: "Error while searching for product",
                    message: error
                })
                this.isInstalled = false;
                this.isDownloaded = false;
            }

        },

        toggleActive(value){
            this.loadingActive = true;
            if(value){
                this.hxApiService.activatePluginInternally(this.technicalName, Shopware.Context.api.authToken.access)
                    .then(() => {
                        this.hxShopwareUtilityService.clearShopwareCache(Shopware.Context.api.authToken.access)
                            .then(() => {
                                this.loadingActive = false;
                                this.reload();
                                this.makeActivationSuccess();
                            })
                            .catch(() => {
                                this.loadingActive = false;
                                this.makeCacheError();
                            })

                    })
                    .catch(error => {
                        this.loadingActive = false;
                        console.log(error);
                    });
            }else{
                this.hxApiService.deactivatePluginInternally(this.technicalName, Shopware.Context.api.authToken.access)
                    .then(() => {
                        this.hxShopwareUtilityService.clearShopwareCache(Shopware.Context.api.authToken.access)
                            .then(() => {
                                this.loadingActive = false;
                                this.reload();
                                this.makeDeactivationSuccess();
                            })
                            .catch(error => {
                                this.loadingActive = false;
                                this.makeCacheError();
                        })

                    })
                    .catch(error => {
                        this.loadingActive = false;
                        console.log(error);
                    });
            }


            this.isActive = value
            console.log("Toggling active state to: " + this.isActive);
        },

        async checkIfActive() {
            this.loadingActive = true;
            if(this.title == null) {
                this.createNotificationError({
                    title: "Unknown Name",
                    message: "Diese Extension hat keinen Namen. Bitte kontaktieren Sie den Entwickler."
                })
                this.isActive = false;
                this.loadingActive = false;
            }

            const criteria = new Shopware.Data.Criteria();
            criteria.addFilter(Shopware.Data.Criteria.equals('name', this.title));

            try {
                const result = await this.extensionRepository.search(criteria, Shopware.Context.api);
                if(result.total !== 0) {
                    let plugin = result.getAt(0);

                    this.isActive = plugin.active;
                    this.loadingActive = false;
                }else{
                    this.loadingActive = false;
                }

            } catch (error) {
                this.createNotificationError({
                    title: "Error while searching for product",
                    message: error
                })
                this.isActive = false;
                this.loadingActive = false;
            }

        },
        checkForCustomUpdates(version) {
            console.log("Übergeben Version: " + version);
            if(!this.verified){
                this.createNotificationError({
                    title: 'Error',
                    message: 'Fehler beim Abrufen der Konfiguration'
                });
                this.loadingActive = false;
                return;
            }

            if(this.isInstalled === false){
                this.loadingActive = false;
                return;
            }

            this.hxApiService.checkPluginUpdatable(this.storeNumber, this.key, this.extensionId, version)
                .then(result => {
                    if(result.type === "success"){
                        if(this.version === result.version) {
                            console.log("Version is the same, no update available.");
                            this.isUpdateAvailable = false;
                            this.loadingActive = false;
                        }else{
                            this.updateToVersion = result.version;
                            this.isUpdateAvailable = result.updateable;
                            console.log("Version is different, update available: " + this.isUpdateAvailable);
                            this.loadingActive = false;
                        }
                    }
                    console.log(result);
                })
                .catch(error => {
                    console.log(error);
                    this.loadingActive = false;
                })
        },

        install(){
            this.hxApiService.installInternal(this.technicalName, Shopware.Context.api.authToken.access)
                .then( () => {
                    this.reload();
                })
                .catch(error => console.log(error))
        },

        makeCacheError(){
            this.createNotificationError({
                title: this.$tc('shopelfen-store.extension.cacheError.title', 0, {extension: this.title}),
                message: this.$tc('shopelfen-store.extension.cacheError.description', 0, {extension: this.title})
            });
        },

        makeActivationSuccess() {
            this.createNotificationSuccess({
                title: this.$tc('shopelfen-store.extension.activate.title', 0, {extension: this.title}),
                message: this.$tc('shopelfen-store.extension.activate.description', 0, {extension: this.title})
            });
        },

        makeDeactivationSuccess() {
            this.createNotificationSuccess({
                title: this.$tc('shopelfen-store.extension.deactivate.title', 0, {extension: this.title}),
                message: this.$tc('shopelfen-store.extension.deactivate.description', 0, {extension: this.title})
            })
        },

        reload(){
            setTimeout(() => window.location.reload(), 2000);
        },

        update() {
            this.hxApiService.downloadPluginFromRemoteZip(this.technicalName, this.storeNumber, this.key, this.updateToVersion, this.extensionId, Shopware.Context.api.authToken.access, this.composerName)
                .then(result => {
                    console.log("Result got back: ", result);

                    this.hxApiService.updatePlugin(this.technicalName, Shopware.Context.api.authToken.access)
                        .then(() => {
                            this.hxShopwareUtilityService.clearShopwareCache(Shopware.Context.api.authToken.access)
                                .then(() => {
                                    this.loadingActive = false;
                                    this.makeActivationSuccess();
                                    this.generalCheck();
                                })
                                .catch(() => {
                                    this.loadingActive = false;
                                    this.makeCacheError();
                                })
                        })
                })
                .catch(error => {
                    console.log(error);
                })
            console.log("Updating plugin: " + this.title + " to Version: " + this.updateToVersion);
        }
    }
})
