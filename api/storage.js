const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const { action, id, item, value, data } = (req.method === 'POST') ? req.body : req.query;
    const finalData = value || data;

    try {
        const getUpdates = await axios.post(`https://api.telegram.org/bot${TOKEN}/getUpdates`, {
            limit: 100, offset: -100, allowed_updates: ["channel_post"]
        });
        const updates = getUpdates.data.result.reverse();
        const match = updates.find(u => {
            const p = u.channel_post;
            return p && p.text && p.text.includes(`ID:${id}`) && p.text.includes(`ITEM:${item}`);
        });

        if (action === 'post') {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: `ID:${id}\nITEM:${item}\nDATA:${finalData}`
            });
            return res.status(200).json({ code: 700 });
        }

        if (action === 'edit' && match) {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/editMessageText`, {
                chat_id: CHAT_ID,
                message_id: match.channel_post.message_id,
                text: `ID:${id}\nITEM:${item}\nDATA:${finalData}`
            });
            return res.status(200).json({ code: 700 });
        }

        if (action === 'delete' && match) {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/deleteMessage`, {
                chat_id: CHAT_ID,
                message_id: match.channel_post.message_id
            });
            return res.status(200).json({ code: 700 });
        }

        if (action === 'get') {
            if (match) {
                const val = match.channel_post.text.split('DATA:')[1];
                return res.status(200).json({ value: val.trim(), code: 700 });
            }
            return res.status(200).json({ value: "Not Found", code: 404 });
        }
    } catch (e) {
        return res.status(200).json({ code: 580 });
    }
};