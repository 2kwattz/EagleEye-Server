// Constants
const RESTRICTED_PROTOCOLS = ['chrome:', 'edge:', 'about:', 'chrome-extension:'];

// Extension lifecycle management
class ExtensionManager {
    static isRestrictedUrl(url) {
        return RESTRICTED_PROTOCOLS.some(protocol => url.startsWith(protocol));
    }

    static async handleInstallation(details) {
        try {
            switch (details.reason) {
                case 'install':
                    await this.handleFirstInstall();
                    break;
                case 'update':
                    await this.handleUpdate(details.previousVersion);
                    break;
                case 'chrome_update':
                case 'shared_module_update':
                    // Handle browser updates if needed
                    break;
            }
        } catch (error) {
            console.error('Error during installation handling:', error);
        }
    }

    static async handleFirstInstall() {
        try {
            // Initialize default settings with coordinates showing enabled
            const defaultSettings = {
                customOffsetEnabled: false,
                customOffsetValue: 90,
                showCoordinates: true,
                darkMode: true,
                savedCoordinates: []
            };

            // Save default settings
            await chrome.storage.local.set(defaultSettings);

            // Apply settings to all open tabs
            const allTabs = await chrome.tabs.query({});
            for (const tab of allTabs) {
                if (tab.url && !this.isRestrictedUrl(tab.url)) {
                    try {
                        await chrome.tabs.reload(tab.id);
                    } catch (error) {
                        console.error(`Error reloading tab ${tab.id}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error during first install:', error);
        }
    }

    static async handleUpdate(previousVersion) {
        try {
            // Perform any necessary data migrations or updates based on version
            const currentVersion = chrome.runtime.getManifest().version;
            console.log(`Extension updated from ${previousVersion} to ${currentVersion}`);

            // Example: If we need to migrate or update settings in future versions
            // if (previousVersion < "4.0") {
            //     await this.migrateSettingsToV4();
            // }
        } catch (error) {
            console.error('Error during update:', error);
        }
    }
}

// Event Listeners
chrome.runtime.onInstalled.addListener((details) => ExtensionManager.handleInstallation(details));

// Optional: Handle extension uninstall
chrome.runtime.setUninstallURL('https://forms.gle/your-feedback-form', () => {
    if (chrome.runtime.lastError) {
        console.error('Error setting uninstall URL:', chrome.runtime.lastError);
    }
});
