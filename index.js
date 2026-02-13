const { TGDB } = require("tgdb");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const db = new TGDB({
    apiId: parseInt(process.env.API_ID),
    apiHash: process.env.API_HASH,
    session: process.env.SESSION,
    channelId: process.env.CHANNEL_ID
});

app.post("/api/storage", async (req, res) => {
    const { action, id, item, value } = req.body;
    const key = `${id}_${item}`;

    if (value && /hentai|porn|nsfw/i.test(value)) {
        return res.json({ code: 403, msg: "SFW ONLY!" });
    }

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
        res.json({ code: 580 });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running forever on port ${PORT}`);
});