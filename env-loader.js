/**
 * Direct .env Loader for Client-Side JS
 * Fetches and parses the .env file from the root directory.
 */

window.ENV = {};

async function loadEnv() {
    try {
        // FETCH EXCLUSIVELY FROM VERCEL
        // We add a timestamp to bypass any browser or edge caching
        const apiResponse = await fetch('/api/config?t=' + Date.now());

        if (!apiResponse.ok) {
            throw new Error(`Cloud Config Error: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();

        // Map the data to window.ENV
        window.ENV = {
            GOOGLE_SCRIPT_URL: data.GOOGLE_SCRIPT_URL || '',
            IP_API_URL: data.IP_API_URL || 'https://freeipapi.com/api/json',
            VERSION: data.VERSION || '2.3.0'
        };

        console.log('✅ Environment 100% Loaded from Vercel');
        return window.ENV;
    } catch (e) {
        console.error('❌ CRITICAL: Vercel Environment Fetch Failed:', e.message);
        return {};
    }
}

// Export the loader promise
window.envPromise = loadEnv();
