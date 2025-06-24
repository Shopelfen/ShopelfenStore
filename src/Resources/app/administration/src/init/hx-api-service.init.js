import HxApiService from "../service/hx-api.service";

Shopware.Service().register('hxApi', (container) => {
    const initContainer = Shopware.Application.getContainer('init');
    return new HxApiService(initContainer.httpClient);
});
