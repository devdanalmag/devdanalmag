// Vercel Serverless Function to expose public environment variables to the frontend
export default function handler(req, res) {
    // Only expose variables intended for the client
    const config = {
        GOOGLE_SCRIPT_URL: process.env.GOOGLE_SCRIPT_URL,
        IP_API_URL: process.env.IP_API_URL || 'https://freeipapi.com/api/json',
        VERSION: process.env.VERSION || '2.3.0'
    };

    // Allow CORS if needed (though on same domain it's usually fine)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Return JSON
    res.status(200).json(config);
}
