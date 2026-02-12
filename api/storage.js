const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;


    if (req.method === 'GET') {
        const { key } = req.query;
        try {
            const response = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
            const messages = response.data.result;
            

            const match = messages
                .reverse()
                .find(m => m.channel_post && m.channel_post.text.includes(` KEY: ${key}`));

            if (match) {
                const text = match.channel_post.text;
                const value = text.split(' DATA: ')[1] || text.split(' URL: ')[1];
                return res.status(200).json({ value: value.trim() });
            }
            return res.status(200).json({ value: "Not Found" });
        } catch (err) {
            return res.status(500).json({ error: "Read Error" });
        }
    }


    if (req.method === 'POST') {
        const { key, value, type, action } = req.body || {};
        if (!value && action === 'save') return res.status(200).json({ code: 600 });

        try {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: `KEY: ${key}\n DATA: ${value}`,
                parse_mode: 'Markdown'
            });
            return res.status(200).json({ code: 700 });
        } catch (err) {
            return res.status(200).json({ code: 580 });
        }
    }
};