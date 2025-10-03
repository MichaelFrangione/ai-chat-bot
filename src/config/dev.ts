// Global development mode configuration
export const DEV_CONFIG = {
    // Set to true to show tool usage bubbles and other dev features
    SHOW_TOOL_USAGE: false,

    // Set to true to show debug information
    DEBUG_MODE: false,

    // Set to true to show raw tool responses
    SHOW_TOOL_RESPONSES: false
};

// Helper function to check if dev mode is enabled
export const isDevMode = () => {
    return DEV_CONFIG.SHOW_TOOL_USAGE || DEV_CONFIG.DEBUG_MODE || DEV_CONFIG.SHOW_TOOL_RESPONSES;
};

// Helper function to toggle dev mode
export const toggleDevMode = () => {
    DEV_CONFIG.SHOW_TOOL_USAGE = !DEV_CONFIG.SHOW_TOOL_USAGE;
    DEV_CONFIG.DEBUG_MODE = !DEV_CONFIG.DEBUG_MODE;
    DEV_CONFIG.SHOW_TOOL_RESPONSES = !DEV_CONFIG.SHOW_TOOL_RESPONSES;
    return DEV_CONFIG.SHOW_TOOL_USAGE;
};
