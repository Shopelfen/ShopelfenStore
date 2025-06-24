export default class HxShopwareUtilityService {

    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    clearShopwarehttpCache() {
        return this.httpClient.post('/api/_action/cache', {
            cache: ['http']
        }).then(response => response.data);
    }

    clearShopwareConfigCache() {
        return this.httpClient.post('/api/_action/cache', {
            cache: ['config']
        }).then(response => response.data);
    }

    clearShopwareTemplateCache() {
        return this.httpClient.post('/api/_action/cache', {
            cache: ['template']
        }).then(response => response.data);
    }

    clearShopwareRouterCache() {
        return this.httpClient.post('/api/_action/cache', {
            cache: ['router']
        }).then(response => response.data);
    }

    clearShopwareCache(authToken) {
        let headers = {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        };

        return this.httpClient.delete('/_action/cache', headers)
            .then(response => response.data);
    }

    refreshPlugins(authToken){
        return this.httpClient.post('/_action/extension/refresh', null, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        }).then(response => response.data);
    }

    uninstallPlugin(authToken, pluginName) {
        let headers = {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        };

        return this.httpClient.post(`/_action/extension/uninstall/plugin/${pluginName}`, null, headers)
            .then(response => response.data);
    }

    removePlugin(authToken, pluginName) {
        let headers = {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        };

        return this.httpClient.post(`/_action/extension/remove/plugin/${pluginName}`, null, headers)
            .then(response => response.data);
    }
}