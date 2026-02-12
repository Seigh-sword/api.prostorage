const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    const data = (req.method === 'POST') ? req.body : req.query;
    const { action, key, value, fileName, fileData } = data;

    try {
        if (action === 'store' || action === 'replace') {
            if (!value && !fileData) {
                return res.status(200).json({ code: 600 });
            }
            
            let content = '';
            if (fileData) {
                content = `FILE: ${fileName}\nDATA: ${fileData}`;
            } else {
                content = `KEY: ${key}\nDATA: ${value}`;
            }
            
            const uniqueId = Date.now();

            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: `PRO-STORAGE EVENT\n${content}\nID: ${uniqueId}`,
                parse_mode: 'Markdown'
            });
            return res.status(200).json({ code: 700 });
        }

        if (action === 'get') {
            const response = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
            const messages = response.data.result.reverse();
            
            const searchString = fileName ? `FILE: ${fileName}` : `KEY: ${key}`;
            const match = messages.find(m => m.channel_post && m.channel_post.text.includes(searchString));

            if (match) {
                const text = match.channel_post.text;
                const extraction = text.split('DATA: ')[1];
                if (extraction) {
                    return res.status(200).json({ value: extraction.split('\n')[0].trim(), code: 700 });
                }
            }
            return res.status(200).json({ value: "Not Found", code: 404 });
        }
    } catch (err) {
        return res.status(200).json({ code: 580 });
    }
};