# Difference between APP and PLUGIN

There are currently two ways to create an extension:

# APP

An APP is an extension that runs in the Shopware Cloud. It can be managed and installed via the Shopware Account. APPs are typically optimized for cloud use and provide an easy way to extend functionality.

# PLUGIN

A PLUGIN is an extension installed locally on the Shopware system. It can be managed and installed via the Plugin Manager. Plugins generally offer more flexibility and control over functionality since they run directly on the server.

The plugin upload in our store must include the relevant files—meaning whether the plugin has a composer.json or a manifest.xml.

Then it is either of type PLUGIN or type APP.

This should be set up in our store or read during the backend upload. After that, the installation workflow should differ depending on which type it is.
