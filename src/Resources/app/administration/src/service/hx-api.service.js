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
            `https://my.shopelfen.de/extension-api/fetch-licenses/${storeNumber}`, null,
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
            `https://my.shopelfen.de/extension-api/extension-updatable/${storeNumber}`,
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
     * @param pluginName Der technische Name des Plugins, z.B. "ShopelfenPlugin"
     * @param key Der API-Schlüssel für die Authentifizierung zum Shopelfen-Server
     * @param authToken Das Shopware Authentifizierungstoken, um die Anfrage zu autorisieren
     * @param storeNumber Die Store-Nummer aus dem Shopelfen-Backend
     * @param extensionId Die Extension-ID des Plugins, das installiert werden soll
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
            `https://my.shopelfen.de/extension-api/update-extension/${storeNumber}`,
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
        /*return this.httpClient.post( `/_action/extension/update/${type}/${pluginName}`, data, headers).then(response => response.data).catch(error => console.error('Fehler beim Hochladen des Plugins:', error));*/
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