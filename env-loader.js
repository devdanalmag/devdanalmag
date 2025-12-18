/**
 * Direct .env Loader for Client-Side JS
 * Fetches and parses the .env file from the root directory.
 */

window.ENV = {};

async function loadEnv() {
    try {
        // Try to fetch .env from the root
        const response = await fetch('/devdanalmag/.env');
        if (!response.ok) throw new Error('Could not find .env file');

        const text = await response.text();
        const lines = text.split('\n');

        lines.forEach(line => {
            // Ignore comments and empty lines
            if (!line || line.startsWith('#')) return;

            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                // Remove quotes if present
                window.ENV[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        });

        console.log('Environment loaded from .env');
        return window.ENV;
    } catch (e) {
        console.warn('Failed to load .env, falling back to defaults:', e);
        return {};
    }
}

// Export the loader promise
window.envPromise = loadEnv();
