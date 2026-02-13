const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const params = (req.method === 'POST') ? req.body : req.query;
    
    const action = params.action;
    const userKey = params.userKey;
    const item = params.item;
    const val = params.value || params.data;
    const type = params.type || 'KEY';

    try {
        if (action === 'post') {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: `AUTH:${userKey}\nTYPE:${type}\nITEM:${item}\nDATA:${val}\nTS:${Date.now()}`
            });
            return res.status(200).json({ code: 700 });
        }

        if (action === 'get') {
            const response = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=-100`);
            const updates = response.data.result.reverse();
            const match = updates.find(u => {
                const m = u.channel_post || u.message;
                return m && m.text && m.text.includes(`AUTH:${userKey}`) && m.text.includes(`ITEM:${item}`);
            });

            if (match) {
                const text = (match.channel_post || match.message).text;
                return res.status(200).json({ value: text.split('DATA:')[1].split('\n')[0].trim(), code: 700 });
            }
            return res.status(200).json({ value: "Not Found", code: 404 });
        }
        
        return res.status(200).json({ code: 160 });
    } catch (e) {
        return res.status(200).json({ code: 580 });
    }
};