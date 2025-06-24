<?php

namespace ShopelfenStore\Service;

use Shopware\Core\System\SystemConfig\SystemConfigService;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class LicenseGuard
{
    private SystemConfigService $systemConfigService;
    private HttpClientInterface $httpClient;

    public function __construct(
        SystemConfigService $systemConfigService,
        HttpClientInterface $httpClient
    ) {
        $this->systemConfigService = $systemConfigService;
        $this->httpClient = $httpClient;
    }

    public function hasValidLicense(string $pluginKey): bool
    {
        try {

            $localKey = $this->systemConfigService->get('ShopelfenStore.config.myConfigKey');
            $storeNumber = $this->systemConfigService->get('ShopelfenStore.config.storeNumber');

            $response = $this->httpClient->request('POST', "https://my.shopelfen.de/extension-api/has-valid-license", [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'Authorization' => 'key=' . $localKey,
                ],
                'json' => [
                    'pluginKey' => $pluginKey,
                    'storeNumber' => $storeNumber,
                ],
            ]);

            $data = $response->toArray();

            // Check if license is valid
            return isset($data['valid']) && $data['valid'] === true;
        } catch (\Exception $e) {
            // TODO: Log error or handle exception
            return false;
        }
    }
}
