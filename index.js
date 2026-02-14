const TGDB = require("tgdb");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

process.on('uncaughtException', (err) => { console.error('190', err); });

const db = new TGDB({
    apiId: parseInt(process.env.API_ID),
    apiHash: process.env.API_HASH,
    session: process.env.SESSION.trim(),
    channelId: process.env.CHANNEL_ID
});

const cooldowns = new Map();

app.get("/status", (req, res) => {
    res.json({ code: 700 });
});

app.post("/", async (req, res) => {
    const { action, id, item, value } = req.body;
    const now = Date.now();
    const last = cooldowns.get(id) || 0;

    let sizeMb = value ? (Buffer.byteLength(value, 'utf8') / (1024 * 1024)) : 0;
    let waitTime = sizeMb > 100 ? (3000 + (sizeMb * 10)) : 3000;

    if (now - last < waitTime) return res.json({ code: 160 });
    if (sizeMb > 2000) return res.json({ code: 340 });
    if (value && /hentai|porn|nsfw/i.test(value)) return res.json({ code: 230 });

    cooldowns.set(id, now);
    const key = `${id}_${item}`;

    try {
        if (action === 'post' || action === 'edit') {
            await db.set(key, value);
            res.json({ code: 700 });
        } else if (action === 'get') {
            const data = await db.get(key);
            res.json({ value: data || "Not Found", code: 700 });
        } else {
            res.json({ code: 170 });
        }
    } catch (e) {
        res.json({ code: 190, error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {});