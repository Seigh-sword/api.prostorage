const { TGDB } = require("tgdb");

let db = null;

const startDB = async () => {
    if (db) return db;
    db = new TGDB({
        apiId: parseInt(process.env.API_ID),
        apiHash: process.env.API_HASH,
        session: process.env.SESSION,
        channelId: process.env.CHANNEL_ID
    });
    return db;
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { action, id, item, value } = (req.method === 'POST') ? req.body : req.query;
    
    // SFW Filter
    if (value && /hentai|porn|nsfw/i.test(value)) {
        return res.status(200).json({ code: 403, msg: "SFW ONLY!" });
    }

    try {
        const database = await startDB();
        const key = `${id}_${item}`;

        if (action === 'post' || action === 'edit') {
            await database.set(key, value);
            return res.status(200).json({ code: 700 });
        }
        if (action === 'delete') {
            await database.delete(key);
            return res.status(200).json({ code: 700 });
        }
        if (action === 'get') {
            const data = await database.get(key);
            return res.status(200).json({ value: data || "Not Found", code: 700 });
        }
    } catch (e) {
        return res.status(200).json({ code: 580 });
    }
};