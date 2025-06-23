import HxShopwareUtilityService from "../service/hx-shopware-utility.service";

Shopware.Service().register('HxShopwareUtility', (container) => {
    const initContainer = Shopware.Application.getContainer('init');
    return new HxShopwareUtilityService(initContainer.httpClient);
});
