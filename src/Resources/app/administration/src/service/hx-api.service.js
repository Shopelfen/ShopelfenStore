export default class HxApiService {

    DEFAULT_URL = 'https://my.shopelfen.de/extension-api';
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    verify(storeNumber, key) {
        return this.post(`${this.DEFAULT_URL}/verify/${storeNumber}`, key).then(response => response.data);
    }

    fetchPlugins(storeNumber, key) {
        return this.httpClient.post(
            `${this.DEFAULT_URL}/fetch-licenses/${storeNumber}`, null,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=${key}`,
                }
            })
            .then(response => response.data)
    }

    checkPluginUpdatable(storeNumber, key, extensionId, version){
        return this.httpClient.post(
            `${this.DEFAULT_URL}/extension-updatable/${storeNumber}`,
            {
                extensionId: extensionId,
                currentVersion: version
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=${key}`,
                }
            })
            .then(response => response.data)
    }

    requestPluginInstallation(storeNumber, key, extensionId) {
        return this.post(`${this.DEFAULT_URL}/receive-extension/${storeNumber}/$extensionId`, key)
    }

    /**
     *
     * @param pluginName The technical name of the plugin, e.g. "ShopelfenPlugin"
     * @param key The API key for authentication to the Shopelfen server
     * @param authToken The Shopware authentication token to authorize the request  
     * @param storeNumber The store number from the Shopelfen backend
     * @param extensionId The extension ID of the plugin to be installed
     * @returns {any}
     */
    installPluginInternally(pluginName, key, authToken, storeNumber, extensionId) {
        let headers = {
            headers: { Authorization: `key=${key}` },
            responseType: 'blob'
        };

        return this.httpClient.post(`${this.DEFAULT_URL}/receive-extension/${storeNumber}/${extensionId}`, null, headers)
            .then(response => {
                const formData = this.buildFormData(response.data, pluginName);

                return this.httpClient.post('/shopelfen/receive-extension', formData, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'X-Plugin-Name': `${pluginName}.zip`
                    }
                })
                    .then(uploadResponse => uploadResponse.data)
                    .catch(error => {
                        console.log("Error during plugin installation:", error);
                    })
            });
    }

    installInternal(pluginName, authToken) {
        return this.httpClient.post(`/_action/extension/install/plugin/${pluginName}`, null, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        }).then(response => response.data);
    }

    activatePluginInternally(pluginName, authToken, type="plugin") {

        let headers = {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        };

        return this.httpClient.put( `/_action/extension/activate/${type}/${pluginName}`, null, headers)
            .then(response => response.data);
    }

    deactivatePluginInternally(pluginName, authToken, type="plugin") {

        let headers = {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        };

        return this.httpClient.put( `/_action/extension/deactivate/${type}/${pluginName}`, null, headers)
            .then(response => response.data);
    }

    downloadPluginFromRemoteZip(pluginName, storeNumber, key, updateToVersion, extensionId, authToken) {
        const criteria = {
            updateToVersion: updateToVersion,
            extensionId: extensionId
        };

        return this.httpClient.post(
            `${this.DEFAULT_URL}/update-extension/${storeNumber}`,
            criteria,
            {
                headers: { Authorization: `key=${key}` },
                responseType: 'blob'
            }
        )
            .then(response => {
                const formData = this.buildFormData(response.data, pluginName);

                return this.httpClient.post(
                    '/shopelfen/update-receiver',
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'X-Plugin-Name': `${pluginName}.zip`
                        }
                    }
                );
            })
            .then(uploadResponse => uploadResponse.data)
            .catch(error => {
                console.error('Fehler beim Plugin-Update-Prozess:', error);
                throw error;
            });
    }

    updatePlugin(pluginName, authToken) {
        // TODO: Remove Debug Output
        console.log("Updatting: " + pluginName);
        let headers = {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        };

        let data = {
            pluginName: pluginName,
        }

        return this.httpClient.post(`/shopelfen/update`, data, headers)
            .then(response => response.data)
            .catch(error => console.error('Fehler beim Hochladen des Plugins:', error));
    }
    checkFolderInstalled(folderName, authToken) {
        let criteria = {
            filter: [
                {
                    field: 'name',
                    type: 'equals',
                    value: folderName
                }
            ]
        };

        let headers = {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        };

        return this.httpClient.post('/search/plugin', criteria, headers).then(response => response.data)
            .catch(() => false);
    }

    buildFormData(blob, pluginName){
        const file = new File([blob], `${pluginName}.zip`, {
            type: 'application/zip',
            lastModified: Date.now()
        });
        const formData = new FormData();
        formData.append('file', file);

        return formData;
    }

    post(url, key) {
        let headers = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${key}`,
            }
        }

        return this.httpClient.post(url, null, headers);
    }

    get(url, key) {
        let headers = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${key}`,
            }
        }

        return this.httpClient.get(url, null, headers)
            .then(response => response.data)
    }
}