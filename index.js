const TGDB = require("tgdb");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());


process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const db = new TGDB({
    apiId: parseInt(process.env.API_ID),
    apiHash: process.env.API_HASH,
    session: process.env.SESSION.trim(),
    channelId: process.env.CHANNEL_ID
});

app.all("/api/storage", async (req, res) => {
    const { action, id, item, value } = (req.method === 'POST') ? req.body : req.query;
    const key = `${id}_${item}`;
    
    try {
        if (action === 'post' || action === 'edit') {
            await db.set(key, value);
        } else if (action === 'delete') {
            await db.delete(key);
        } else if (action === 'get') {
            const data = await db.get(key);
            return res.json({ value: data || "Not Found", code: 700 });
        }
        res.json({ code: 700 });
    } catch (e) {
        console.error("Operation Error:", e);
        res.json({ code: 580 });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { 
    console.log("ProStorage is active and shielded.");
});