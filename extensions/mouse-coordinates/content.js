// Constants
const CONSTANTS = {
    SCROLL_THRESHOLD: 10,
    NOTIFICATION_DURATION: 2000,
    THROTTLE_DELAY: 16,
    DEBOUNCE_DELAY: 200,
    ANIMATION_DURATION: 300,
    DEFAULT_OFFSET: 90,
    Z_INDEX: {
        COORDINATES: 10000,
        NOTIFICATION: 10001
    },
    THEMES: {
        DARK: {
            BG: "rgba(50, 50, 50, 1)",
            TEXT: "white",
            BORDER: "#666"
        },
        LIGHT: {
            BG: "rgba(255, 255, 255, 1)",
            TEXT: "black",
            BORDER: "black"
        }
    },
    BUTTON_COLORS: {
        SUCCESS: "#4CAF50",
        DANGER: "#f44336"
    }
};

// State management
const state = {
    mouse: { x: -1, y: -1 },
    settings: {
        displayCoordinates: true,
        customOffsetEnabled: false,
        customOffsetValue: CONSTANTS.DEFAULT_OFFSET,
        showCoordinates: true,
        isDarkMode: true,
        autoScrollEnabled: true
    },
    savedCoordinates: [],
    timers: {
        animationFrame: null,
        debounce: null,
        notification: null
    }
};

// DOM Elements cache
const elements = {
    coordinatesDiv: null,
    notification: null
};

// Utility functions
const utils = {
    throttle(func, limit) {
        let lastRan, lastFunc;
        return function(...args) {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        return `#${(0x1000000 + R*0x10000 + G*0x100 + B).toString(16).slice(1)}`;
    }
};

// UI Components
const UI = {
    createButton(label, color, onClick, small = false) {
        const btn = document.createElement("button");
        Object.assign(btn.style, {
            backgroundColor: color,
            color: "white",
            border: "none",
            padding: small ? "3px 7px" : "5px 10px",
            borderRadius: "3px",
            cursor: "pointer",
            marginLeft: "5px",
            fontSize: small ? "12px" : "14px",
            transition: "background-color 0.3s ease"
        });
        btn.textContent = label;
        btn.addEventListener("click", onClick);
        btn.addEventListener("mouseover", () => btn.style.backgroundColor = utils.lightenColor(color, 20));
        btn.addEventListener("mouseout", () => btn.style.backgroundColor = color);
        return btn;
    },

    createCoordinatesDiv() {
        if (elements.coordinatesDiv) return;

        elements.coordinatesDiv = document.createElement("div");
        elements.coordinatesDiv.id = "mouse-coordinates";
        Object.assign(elements.coordinatesDiv.style, {
            position: "fixed",
            width: "300px",
            maxHeight: "300px",
            overflowY: "auto",
            top: "10px",
            right: "10px",
            zIndex: CONSTANTS.Z_INDEX.COORDINATES,
            padding: "10px",
            borderRadius: "5px",
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transition: "background-color 0.3s, color 0.3s"
        });

        document.body.appendChild(elements.coordinatesDiv);
        this.makeElementDraggable(elements.coordinatesDiv);
        this.applyTheme();
        this.setupScrollHandler();
    },

    setupScrollHandler() {
        elements.coordinatesDiv.addEventListener('scroll', () => {
            state.settings.autoScrollEnabled = 
                elements.coordinatesDiv.scrollTop + elements.coordinatesDiv.clientHeight >= 
                elements.coordinatesDiv.scrollHeight - CONSTANTS.SCROLL_THRESHOLD;
            this.updateStickyHeader();
        });
    },

    makeElementDraggable(element) {
        let pos = { x: 0, y: 0, startX: 0, startY: 0 };
        element.style.cursor = 'move';

        const dragStart = (e) => {
            e.preventDefault();
            pos.startX = e.clientX;
            pos.startY = e.clientY;
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        };

        const drag = (e) => {
            e.preventDefault();
            pos.x = pos.startX - e.clientX;
            pos.y = pos.startY - e.clientY;
            pos.startX = e.clientX;
            pos.startY = e.clientY;
            element.style.top = `${element.offsetTop - pos.y}px`;
            element.style.left = `${element.offsetLeft - pos.x}px`;
        };

        const dragEnd = () => {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
            element.style.cursor = 'default';
        };

        element.addEventListener('mousedown', dragStart);
    },

    applyTheme() {
        if (!elements.coordinatesDiv) return;
        
        const theme = state.settings.isDarkMode ? CONSTANTS.THEMES.DARK : CONSTANTS.THEMES.LIGHT;
        Object.assign(elements.coordinatesDiv.style, {
            backgroundColor: theme.BG,
            color: theme.TEXT,
            border: `1px solid ${theme.BORDER}`
        });
        this.updateStickyHeader();
    },

    updateStickyHeader() {
        const header = document.getElementById("current-coordinates");
        if (!header) return;

        const theme = state.settings.isDarkMode ? CONSTANTS.THEMES.DARK : CONSTANTS.THEMES.LIGHT;
        Object.assign(header.style, {
            backgroundColor: theme.BG,
            boxShadow: elements.coordinatesDiv.scrollTop > 0 ? "0 2px 5px rgba(0,0,0,0.2)" : "none"
        });
    },

    showNotification(message) {
        if (state.timers.notification) {
            clearTimeout(state.timers.notification);
            elements.notification?.remove();
        }

        elements.notification = document.createElement("div");
        Object.assign(elements.notification.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            zIndex: CONSTANTS.Z_INDEX.NOTIFICATION,
            opacity: "0",
            transition: "opacity 0.3s ease-in-out"
        });
        elements.notification.textContent = message;

        document.body.appendChild(elements.notification);
        requestAnimationFrame(() => elements.notification.style.opacity = "1");

        state.timers.notification = setTimeout(() => {
            elements.notification.style.opacity = "0";
            setTimeout(() => elements.notification.remove(), CONSTANTS.ANIMATION_DURATION);
        }, CONSTANTS.NOTIFICATION_DURATION);
    }
};

// Coordinate Management
const CoordinateManager = {
    updateMousePosition(event) {
        state.mouse.x = event.clientX;
        state.mouse.y = state.settings.customOffsetEnabled ? 
            event.clientY + state.settings.customOffsetValue : 
            event.clientY;

        if (state.settings.displayCoordinates) {
            if (state.timers.animationFrame) {
                cancelAnimationFrame(state.timers.animationFrame);
            }
            state.timers.animationFrame = requestAnimationFrame(() => this.updateDisplay());
        }
    },

    updateDisplay(scrollToBottom = false) {
        if (!elements.coordinatesDiv || !state.settings.showCoordinates) return;

        const currentCoords = `
            <div id="current-coordinates" style="position: sticky; top: 0; background-color: inherit; padding: 5px 0; z-index: 1;">
                Mouse Coordinates: X: ${state.mouse.x}, Y: ${state.mouse.y}<br>
                <small>Press "x" to save coordinates | "c" to copy current | "z" to undo last save</small>
            </div>
        `;

        const coordsHtml = state.savedCoordinates.map((coord, index) => `
            <p style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                Saved ${index + 1}: X: ${coord.x}, Y: ${coord.y}
                <span>
                    <button class="copy-btn" data-index="${index}" 
                        style="background-color: ${CONSTANTS.BUTTON_COLORS.SUCCESS}; color: white; border: none; 
                        padding: 3px 7px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-left: 5px;">
                        Copy
                    </button>
                    <button class="delete-btn" data-index="${index}" 
                        style="background-color: ${CONSTANTS.BUTTON_COLORS.DANGER}; color: white; border: none; 
                        padding: 3px 7px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-left: 5px;">
                        Delete
                    </button>
                </span>
            </p>
        `).join('');

        elements.coordinatesDiv.innerHTML = currentCoords + coordsHtml;
        this.appendActionButtons();
        UI.applyTheme();
        this.setupCoordinateButtons();

        if (scrollToBottom && state.settings.autoScrollEnabled) {
            requestAnimationFrame(() => {
                elements.coordinatesDiv.scrollTop = elements.coordinatesDiv.scrollHeight;
            });
        }
    },

    appendActionButtons() {
        const btnContainer = document.createElement("div");
        btnContainer.style.display = "flex";
        btnContainer.style.justifyContent = "space-between";
        btnContainer.style.marginTop = "10px";

        const copyAllBtn = UI.createButton("Copy All", CONSTANTS.BUTTON_COLORS.SUCCESS, () => this.copyAllCoordinates());
        const clearAllBtn = UI.createButton("Clear All", CONSTANTS.BUTTON_COLORS.DANGER, () => this.clearAllCoordinates());

        btnContainer.appendChild(copyAllBtn);
        btnContainer.appendChild(clearAllBtn);
        elements.coordinatesDiv.appendChild(btnContainer);
    },

    setupCoordinateButtons() {
        elements.coordinatesDiv.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copySingleCoordinate(parseInt(btn.dataset.index)));
        });

        elements.coordinatesDiv.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteSingleCoordinate(parseInt(btn.dataset.index)));
        });
    },

    saveCurrentCoordinates() {
        if (!state.settings.showCoordinates) return;
        
        state.savedCoordinates.push({ x: state.mouse.x, y: state.mouse.y });
        this.updateDisplay(true);
        this.saveToStorage();
        UI.showNotification("Coordinates saved!");
    },

    copyCurrentCoordinates() {
        const text = `X: ${state.mouse.x}, Y: ${state.mouse.y}`;
        navigator.clipboard.writeText(text)
            .then(() => UI.showNotification("Current coordinates copied!"))
            .catch(err => console.error('Failed to copy coordinates:', err));
    },

    undoLastSave() {
        if (state.savedCoordinates.length === 0) return;
        
        state.savedCoordinates.pop();
        this.updateDisplay();
        this.saveToStorage();
        UI.showNotification("Last save undone!");
    },

    copySingleCoordinate(index) {
        const coord = state.savedCoordinates[index];
        const text = `X: ${coord.x}, Y: ${coord.y}`;
        navigator.clipboard.writeText(text)
            .then(() => UI.showNotification("Coordinate copied!"))
            .catch(err => console.error('Failed to copy coordinate:', err));
    },

    copyAllCoordinates() {
        const text = state.savedCoordinates
            .map(coord => `X: ${coord.x}, Y: ${coord.y}`)
            .join("\n");
        navigator.clipboard.writeText(text)
            .then(() => UI.showNotification("All coordinates copied!"))
            .catch(err => console.error('Failed to copy coordinates:', err));
    },

    deleteSingleCoordinate(index) {
        state.savedCoordinates.splice(index, 1);
        this.updateDisplay();
        this.saveToStorage();
    },

    clearAllCoordinates() {
        state.savedCoordinates = [];
        this.updateDisplay();
        this.saveToStorage();
    },

    saveToStorage() {
        chrome.storage.local.set({ savedCoordinates: state.savedCoordinates })
            .catch(err => console.error('Failed to save coordinates:', err));
    }
};

// Event Handlers
const EventHandlers = {
    handleKeyPress(event) {
        if (!state.settings.displayCoordinates) return;

        const keyHandlers = {
            'x': () => {
                if (state.timers.debounce) clearTimeout(state.timers.debounce);
                state.timers.debounce = setTimeout(() => CoordinateManager.saveCurrentCoordinates(), CONSTANTS.DEBOUNCE_DELAY);
            },
            'c': () => CoordinateManager.copyCurrentCoordinates(),
            'z': () => CoordinateManager.undoLastSave()
        };

        const handler = keyHandlers[event.key.toLowerCase()];
        if (handler) handler();
    },

    handleSpecialWebsites() {
        const interactiveElements = document.querySelectorAll('#map, .map, canvas');
        const throttledUpdate = utils.throttle(
            (e) => CoordinateManager.updateMousePosition(e), 
            CONSTANTS.THROTTLE_DELAY
        );

        interactiveElements.forEach(element => {
            element.addEventListener('mousemove', throttledUpdate);
            element.addEventListener('keydown', this.handleKeyPress);
        });
    }
};

// Chrome Extension Message Handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        let settingsChanged = false;

        if (request.customOffsetEnabled !== undefined) {
            state.settings.customOffsetEnabled = request.customOffsetEnabled;
            state.settings.customOffsetValue = request.customOffsetValue;
            settingsChanged = true;
        }
        if (request.showCoordinates !== undefined) {
            state.settings.showCoordinates = request.showCoordinates;
            state.settings.displayCoordinates = request.showCoordinates; // Sync both states
            // Handle show/hide immediately
            if (!state.settings.showCoordinates) {
                if (elements.coordinatesDiv) {
                    elements.coordinatesDiv.remove();
                    elements.coordinatesDiv = null;
                }
            } else {
                // Create and show coordinates if they don't exist
                if (!elements.coordinatesDiv) {
                    UI.createCoordinatesDiv();
                    CoordinateManager.updateDisplay();
                } else {
                    elements.coordinatesDiv.style.display = 'block';
                }
            }
            settingsChanged = true;
        }
        if (request.darkMode !== undefined) {
            state.settings.isDarkMode = request.darkMode;
            UI.applyTheme();
            settingsChanged = true;
        }

        // Return true to indicate we'll send a response asynchronously
        if (settingsChanged) {
            // Save current state back to storage to ensure sync
            chrome.storage.local.set({
                customOffsetEnabled: state.settings.customOffsetEnabled,
                customOffsetValue: state.settings.customOffsetValue,
                showCoordinates: state.settings.showCoordinates,
                darkMode: state.settings.isDarkMode
            }).then(() => {
                sendResponse({
                    status: "Settings updated",
                    currentState: {
                        showCoordinates: state.settings.showCoordinates,
                        isDarkMode: state.settings.isDarkMode,
                        customOffsetEnabled: state.settings.customOffsetEnabled,
                        customOffsetValue: state.settings.customOffsetValue
                    }
                });
            }).catch(error => {
                console.error('Error saving settings:', error);
                sendResponse({
                    status: "Error",
                    error: error.message
                });
            });
            return true; // Will respond asynchronously
        }

        // If no settings changed, respond immediately
        sendResponse({
            status: "No changes",
            currentState: {
                showCoordinates: state.settings.showCoordinates,
                isDarkMode: state.settings.isDarkMode,
                customOffsetEnabled: state.settings.customOffsetEnabled,
                customOffsetValue: state.settings.customOffsetValue
            }
        });
    } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({status: "Error", error: error.message});
    }
});

// Initialization
function initializeExtension() {
    chrome.storage.local.get(
        ['customOffsetEnabled', 'customOffsetValue', 'showCoordinates', 'savedCoordinates', 'darkMode'],
        (result) => {
            const showCoordinates = result.showCoordinates ?? true;
            Object.assign(state.settings, {
                customOffsetEnabled: result.customOffsetEnabled ?? false,
                customOffsetValue: result.customOffsetValue ?? CONSTANTS.DEFAULT_OFFSET,
                showCoordinates: showCoordinates,
                displayCoordinates: showCoordinates, // Sync both states
                isDarkMode: result.darkMode ?? true
            });
            state.savedCoordinates = result.savedCoordinates ?? [];

            // Only create and show coordinates div if enabled
            if (state.settings.showCoordinates) {
                UI.createCoordinatesDiv();
                CoordinateManager.updateDisplay();
            }
            EventHandlers.handleSpecialWebsites();
        }
    );
}

// Event Listeners
document.addEventListener("mousemove", utils.throttle(
    (e) => CoordinateManager.updateMousePosition(e),
    CONSTANTS.THROTTLE_DELAY
));
document.addEventListener("keydown", (e) => EventHandlers.handleKeyPress(e));

// Initialize based on document ready state
function initialize() {
    // Get the current state before initializing
    chrome.storage.local.get(['showCoordinates'], function(result) {
        // Only set default if it's the first installation (undefined)
        if (result.showCoordinates === undefined) {
            chrome.storage.local.set({ showCoordinates: true });
            // Continue with initialization since it's first install
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeExtension);
            } else {
                initializeExtension();
            }
        } else {
            // For existing installations, only initialize if coordinates are enabled
            if (result.showCoordinates) {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initializeExtension);
                } else {
                    initializeExtension();
                }
            }
        }
    });
}

initialize();
