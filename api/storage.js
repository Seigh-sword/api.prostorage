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
    const id = params.id;
    const item = params.item;
    const val = params.value || params.data;

    try {
        if (action === 'post') {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: `ID:${id}\nITEM:${item}\nDATA:${val}`
            });
            return res.status(200).json({ code: 700 });
        }

        if (action === 'get') {
            const response = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates?limit=100&offset=-1`);
            const updates = response.data.result.reverse();
            
            const match = updates.find(u => {
                const m = u.channel_post || u.message;
                return m && m.text && m.text.includes(`ID:${id}`) && m.text.includes(`ITEM:${item}`);
            });

            if (match) {
                const text = (match.channel_post || match.message).text;
                const extraction = text.split('DATA:')[1];
                return res.status(200).json({ value: extraction.trim(), code: 700 });
            }
            return res.status(200).json({ value: "Not Found", code: 404 });
        }
    } catch (e) {
        return res.status(200).json({ code: 580 });
    }
};