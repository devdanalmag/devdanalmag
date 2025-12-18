(async function () {
    // Wait for the environment loader to finish
    await window.envPromise;

    const GOOGLE_SCRIPT_URL = window.ENV ? window.ENV.GOOGLE_SCRIPT_URL : '';
    const IP_API_URL = window.ENV ? window.ENV.IP_API_URL : 'https://ip-api.com/json/?fields=status,query,country,countryCode,regionName,city';

    const SESSION_KEY = 'portfolio_session_active';

    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return "Mobile";
        return "Desktop";
    }

    async function getVisitorInfo() {
        const device = getDeviceType();
        try {
            const response = await fetch(IP_API_URL);
            const data = await response.json();

            if (data.status === 'success') {
                return {
                    ip: data.query,
                    country: data.country,
                    countryCode: data.countryCode,
                    region: data.regionName,
                    city: data.city,
                    device: device,
                    timestamp: Date.now()
                };
            }
            throw new Error('API failure');
        } catch (e) {
            return {
                ip: 'Unknown',
                country: 'Unknown',
                countryCode: '',
                region: '',
                city: '',
                device: device,
                timestamp: Date.now()
            };
        }
    }

    async function track() {
        const isNewSession = !sessionStorage.getItem(SESSION_KEY);
        if (isNewSession) {
            sessionStorage.setItem(SESSION_KEY, 'true');
        }

        const info = await getVisitorInfo();
        info.isNewSession = isNewSession;
        info.isPageView = true;

        // Send to Google Sheets if URL is provided
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE') {
            try {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Apps Script requires no-cors for simple POSTs or handles CORS as defined
                    body: JSON.stringify(info),
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('Log sent to cloud');
            } catch (e) {
                console.error('Cloud logging failed:', e);
            }
        } else {
            // Fallback to localStorage if no cloud URL set
            console.warn('Google Script URL not set. Falling back to local logging.');
            let visitors = [];
            try {
                const data = localStorage.getItem('portfolio_visitors');
                visitors = data ? JSON.parse(data) : [];
            } catch (e) { }
            visitors.push(info);
            localStorage.setItem('portfolio_visitors', JSON.stringify(visitors.slice(-1000)));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', track);
    } else {
        track();
    }
})();
