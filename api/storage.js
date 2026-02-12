const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const { key, value, type, action } = req.body;

    // Rule 4: Value can't be empty for saves
    if (!value && action === 'save') return res.status(200).json({ code: 600 });

    try {
        let message = '';
        if (type === 'file') {
            message = ` *FILE KEY:* ${key}\n *URL:* ${value}`;
        } else {
            message = ` *KEY:* ${key}\n *DATA (${type || 'text'}):* ${value}`;
        }

        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        // Rule 4: Success Code
        return res.status(200).json({ code: 700 }); 
    } catch (err) {
        // Rule 4: Error Codes
        if (err.response && err.response.status === 429) return res.status(200).json({ code: 460 });
        return res.status(200).json({ code: 580 });
    }
};