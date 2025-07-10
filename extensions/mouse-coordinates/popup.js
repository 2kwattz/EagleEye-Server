// Constants
const ELEMENTS = {
    offsetToggle: () => document.getElementById('offsetToggle'),
    offsetValue: () => document.getElementById('offsetValue'),
    showCoordinatesToggle: () => document.getElementById('showCoordinatesToggle'),
    refreshPageButton: () => document.getElementById('refreshPage'),
    saveInstructions: () => document.getElementById('saveInstructions'),
    themeToggle: () => document.getElementById('themeToggle')
};

const SETTINGS_KEYS = {
    CUSTOM_OFFSET_ENABLED: 'customOffsetEnabled',
    CUSTOM_OFFSET_VALUE: 'customOffsetValue',
    SHOW_COORDINATES: 'showCoordinates',
    DARK_MODE: 'darkMode'
};

const DEFAULT_SETTINGS = {
    [SETTINGS_KEYS.CUSTOM_OFFSET_ENABLED]: false,
    [SETTINGS_KEYS.CUSTOM_OFFSET_VALUE]: 90,
    [SETTINGS_KEYS.SHOW_COORDINATES]: true, // Always default to true for new installations
    [SETTINGS_KEYS.DARK_MODE]: true
};

// Ensure settings are properly initialized
async function ensureDefaultSettings() {
    const settings = await chrome.storage.local.get(Object.values(SETTINGS_KEYS));
    const needsInitialization = !settings[SETTINGS_KEYS.SHOW_COORDINATES];
    
    if (needsInitialization) {
        await chrome.storage.local.set(DEFAULT_SETTINGS);
    }
    return settings;
}

const THEME = {
    DARK: {
        BG: '#333',
        TEXT: '#f9f9f9',
        INPUT_BG: '#555',
        INPUT_TEXT: '#fff',
        BUTTON_BG: '#4CAF50',
        BUTTON_TEXT: '#fff'
    },
    LIGHT: {
        BG: '#f9f9f9',
        TEXT: '#333',
        INPUT_BG: '#fff',
        INPUT_TEXT: '#333',
        BUTTON_BG: '#4CAF50',
        BUTTON_TEXT: '#fff'
    }
};

// Settings Manager
const SettingsManager = {
    async loadSettings() {
        try {
            const settings = await chrome.storage.local.get(Object.values(SETTINGS_KEYS));
            return {
                ...DEFAULT_SETTINGS,
                ...settings
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return DEFAULT_SETTINGS;
        }
    },

    async saveSettings(settings) {
        try {
            await chrome.storage.local.set(settings);
            await this.broadcastSettingsToTabs(settings);
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    },

    async broadcastSettingsToTabs(settings) {
        const tabs = await chrome.tabs.query({});
        const sendPromises = tabs.map(tab => {
            // Skip restricted URLs
            if (tab.url && !this.isRestrictedUrl(tab.url)) {
                return this.sendMessageToTab(tab.id, settings);
            }
            return Promise.resolve();
        });
        
        await Promise.allSettled(sendPromises);
    },

    isRestrictedUrl(url) {
        const restrictedProtocols = ['chrome:', 'edge:', 'about:'];
        return restrictedProtocols.some(protocol => url.startsWith(protocol));
    },

    async sendMessageToTab(tabId, settings) {
        try {
            await chrome.tabs.sendMessage(tabId, settings);
        } catch (error) {
            // Ignore connection errors for inactive tabs
            if (!error.message.includes('receiving end does not exist')) {
                console.error(`Error sending message to tab ${tabId}:`, error);
            }
        }
    }
};

// UI Manager
const UIManager = {
    initializeUI(settings) {
        const elements = this.getElements();
        
        elements.offsetToggle.checked = settings[SETTINGS_KEYS.CUSTOM_OFFSET_ENABLED];
        elements.offsetValue.value = settings[SETTINGS_KEYS.CUSTOM_OFFSET_VALUE];
        elements.offsetValue.disabled = !elements.offsetToggle.checked;
        elements.showCoordinatesToggle.checked = settings[SETTINGS_KEYS.SHOW_COORDINATES];
        elements.themeToggle.checked = settings[SETTINGS_KEYS.DARK_MODE];

        this.toggleSaveInstructions(elements.showCoordinatesToggle.checked);
        this.applyTheme(settings[SETTINGS_KEYS.DARK_MODE]);
    },

    getElements() {
        const elements = {};
        for (const [key, getter] of Object.entries(ELEMENTS)) {
            const element = getter();
            if (!element) {
                throw new Error(`Required element not found: ${key}`);
            }
            elements[key] = element;
        }
        return elements;
    },

    setupEventListeners() {
        const elements = this.getElements();

        elements.offsetToggle.addEventListener('change', () => this.handleSettingChange());
        elements.offsetValue.addEventListener('change', () => this.handleSettingChange());
        elements.showCoordinatesToggle.addEventListener('change', () => this.handleSettingChange());
        elements.themeToggle.addEventListener('change', () => this.handleThemeToggle());
        elements.refreshPageButton.addEventListener('click', () => this.refreshActivePage());
    },

    async handleSettingChange() {
        const elements = this.getElements();
        elements.offsetValue.disabled = !elements.offsetToggle.checked;

        const offsetValue = parseInt(elements.offsetValue.value, 10);
        if (isNaN(offsetValue)) {
            console.error('Invalid offset value');
            return;
        }

        const settings = {
            [SETTINGS_KEYS.CUSTOM_OFFSET_ENABLED]: elements.offsetToggle.checked,
            [SETTINGS_KEYS.CUSTOM_OFFSET_VALUE]: offsetValue,
            [SETTINGS_KEYS.SHOW_COORDINATES]: elements.showCoordinatesToggle.checked,
            [SETTINGS_KEYS.DARK_MODE]: elements.themeToggle.checked
        };

        try {
            // First update storage
            await chrome.storage.local.set(settings);
            
            // Get active tab to update UI based on its response
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab?.id && !SettingsManager.isRestrictedUrl(activeTab.url)) {
                const response = await chrome.tabs.sendMessage(activeTab.id, settings);
                if (response?.currentState) {
                    // Update UI to match the actual state from the content script
                    elements.showCoordinatesToggle.checked = response.currentState.showCoordinates;
                    elements.themeToggle.checked = response.currentState.isDarkMode;
                    elements.offsetToggle.checked = response.currentState.customOffsetEnabled;
                    elements.offsetValue.value = response.currentState.customOffsetValue;
                    this.toggleSaveInstructions(response.currentState.showCoordinates);
                    this.applyTheme(response.currentState.isDarkMode);
                }
            }

            // Then update other tabs
            await SettingsManager.broadcastSettingsToTabs(settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
            // Revert UI if save failed
            const currentSettings = await SettingsManager.loadSettings();
            this.initializeUI(currentSettings);
        }
    },

    async handleThemeToggle() {
        const elements = this.getElements();
        this.applyTheme(elements.themeToggle.checked);
        await this.handleSettingChange();
    },

    toggleSaveInstructions(show) {
        const elements = this.getElements();
        elements.saveInstructions.style.display = show ? 'block' : 'none';
    },

    applyTheme(isDarkMode) {
        const theme = isDarkMode ? THEME.DARK : THEME.LIGHT;
        const root = document.documentElement;

        Object.entries({
            '--bg-color': theme.BG,
            '--text-color': theme.TEXT,
            '--input-bg-color': theme.INPUT_BG,
            '--input-text-color': theme.INPUT_TEXT,
            '--button-bg-color': theme.BUTTON_BG,
            '--button-text-color': theme.BUTTON_TEXT
        }).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    },

    async refreshActivePage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.id) {
                await chrome.tabs.reload(tab.id);
            }
        } catch (error) {
            console.error('Error refreshing page:', error);
        }
    }
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get the actual current state from storage
        const currentState = await chrome.storage.local.get(Object.values(SETTINGS_KEYS));
        
        // Only set defaults if this is first time (no settings exist)
        if (Object.keys(currentState).length === 0) {
            await chrome.storage.local.set(DEFAULT_SETTINGS);
            UIManager.initializeUI(DEFAULT_SETTINGS);
        } else {
            // Use actual stored state
            UIManager.initializeUI(currentState);
        }
        
        UIManager.setupEventListeners();
    } catch (error) {
        console.error('Error initializing popup:', error);
    }
});
