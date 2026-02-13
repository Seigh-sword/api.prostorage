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
            const finalData = data || value;
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: `USER:${userId}\n${entry}\nDATA:${finalData}\nID:${Date.now()}`
            });
            return res.status(200).json({ code: 700 });
        }

        if (action === 'get') {
            const response = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates?limit=100&offset=-1`);
            const updates = response.data.result.reverse();
            const userTag = `USER:${userId}`;
            const itemTag = name ? `FILE:${name}` : `KEY:${key}`;
            
            const match = updates.find(u => {
                const msg = u.channel_post || u.message;
                return msg && msg.text && msg.text.includes(userTag) && msg.text.includes(itemTag);
            });

            if (match) {
                const msgText = (match.channel_post || match.message).text;
                const val = msgText.split('DATA:')[1].split('\n')[0].trim();
                return res.status(200).json({ value: val, code: 700 });
            }
            return res.status(200).json({ value: "Not Found", code: 404 });
        }
    } catch (e) {
        return res.status(200).json({ code: 580 });
    }
}; 