const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const params = (req.method === 'POST') ? req.body : req.query;
    const { action, key, value, name, data, userId } = params;

    try {
        if (action === 'store') {
            const entry = name ? `FILE:${name}` : `KEY:${key}`;
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: `USER:${userId}\n${entry}\nDATA:${data || value}\nID:${Date.now()}`
            });
            return res.status(200).json({ code: 700 });
        }

        if (action === 'get') {
            const response = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
            const updates = response.data.result.reverse();
            const search = `USER:${userId}`;
            const subSearch = name ? `FILE:${name}` : `KEY:${key}`;
            
            const found = updates.find(u => 
                u.channel_post && 
                u.channel_post.text.includes(search) && 
                u.channel_post.text.includes(subSearch)
            );

            if (found) {
                const val = found.channel_post.text.split('DATA:')[1].split('\n')[0];
                return res.status(200).json({ value: val.trim(), code: 700 });
            }
            return res.status(200).json({ value: "Not Found", code: 404 });
        }
    } catch (e) {
        return res.status(200).json({ code: 580 });
    }
};