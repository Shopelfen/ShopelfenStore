
# How to user the LicenseGuard in your Plugin

## What is the LicenseGuard?

The LicenseGuard is a service that allows you to check if the User who is using your plugin has a valid license for it. It is used to prevent unauthorized use of your plugin.
The LicenseGuard uses our api to determine if the user has a valid license. All you have to do is to inject the service into your class and call is 'hasValidLicense' method with the technical Name of your Plugin.

## How to use the LicenseGuard

1. Inject the LicenseGuard service into your class:
    ```php
    use Shopelfen\Store\Service\LicenseGuard;
    class MyPluginService
    {
        private LicenseGuard $licenseGuard;

        public function __construct(LicenseGuard $licenseGuard)
        {
            $this->licenseGuard = $licenseGuard;
        }
    }
    ```
2. Call the `hasValidLicense` method with the technical name of your plugin:
    ```php
        $hasValidLicense = $this->licenseGuard->hasValidLicense('MyPluginTechnicalName');
    ```

3. Handle the case where the user does not have a valid license:
    ```php
    public function someMethod()
    {
    $hasValidLicense = $this->licenseGuard->hasValidLicense('MyPluginTechnicalName');

    if (!$hasValidLicense) {
        // Handle the case where the user does not have a valid license
        // For example, you can throw an exception or redirect the user
        throw new \Exception('You do not have a valid license to uses this plugin.');
    }

    // Continue with the logic of your plugin
    }
    ```
   
With this setup, you can ensure that the customer has a valid license for your plugin before even allowing them to install it. 
This helps to protect your intellectual property and ensures that only authorized users can use your plugin.

## Secure your Plugin even more

To further secure your plugin, you can implement additional checks in your plugin's main class or service. For example, you can check the license validity at specific points in your plugin's execution flow, such as during initialization or before executing critical functionality.
This way, you can ensure that the user has a valid license at all times while using your plugin.

## What to do if your plugin panics

Panic is a big word to use in the context of a plugin, but people can go a long way to use a plugin they should´nt. 
For this specific reason we have implemented a `panic` api endpoint that allows you to report a panic in multiple instances of your plugin if the LicenseGuard was not found or by other measures. 

If the panic api endpoint is triggered by your plugin, it will report the panic status to our servers.
We then handle the interaction with the customer to resolve the issue.

All your have to do is to call the `panic` endpoint:
```php
    try {
        $response = $this->httpClient->request('POST', "https://my.shopelfen.de/extension-api/panic", [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'json' => [
                'technicalName' => "yourPluginTechnicalName",
            ],
        ]);
            
        // Get the response data from our api 
        $data = $response->toArray();
        } catch (\Exception $e) {
            // handling the exception, for example, log the error or notify the user
        }
```

The responses in this case can vary. For example, if the user or the store has a valid license, the response will be a success message.

```json
{
    "success": true,
    "error-reported": false,
    "message": "The user has a valid license for this plugin."
}
```
If the user has no valid license, the response will be a success message, but the error-reported flag will be set to true. This means that we will notify the shop owner about the licensing issue.

```json
{
   "success": true,
   "error-reported": true,
   "message": "The Shop owner will be notified about a licensing issue."
}
```