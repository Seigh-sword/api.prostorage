const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const params = (req.method === 'POST') ? req.body : req.query;
    const { action, id, item, value, data } = params;

    try {
        if (action === 'post') {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: `ID:${id}\nITEM:${item}\nDATA:${value || data}`
            });
            return res.status(200).json({ code: 700 });
        }

        if (action === 'get') {
            const response = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates?limit=100&offset=-100`);
            const updates = response.data.result.reverse();
            
            const match = updates.find(u => {
                const post = u.channel_post || u.edited_channel_post;
                return post && post.text && post.text.includes(`ID:${id}`) && post.text.includes(`ITEM:${item}`);
            });

            if (match) {
                const post = match.channel_post || match.edited_channel_post;
                const val = post.text.split('DATA:')[1];
                if (val) return res.status(200).json({ value: val.trim(), code: 700 });
            }
            return res.status(200).json({ value: "Not Found", code: 404 });
        }
    } catch (e) {
        return res.status(200).json({ code: 580 });
    }
};