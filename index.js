const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: '2048mb' }));

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION.trim());
const channelId = process.env.CHANNELID;

const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

let queueBusyUntil = 0;

(async () => {
    try {
        await client.connect();
        console.log("700");
    } catch (e) {
        console.error("190");
    }
})();

app.all("/", async (req, res) => {
    const isPost = req.method === 'POST';
    const { action, id, item, value } = isPost ? req.body : req.query;
    
    if (!id || !item) return res.json({ code: 170 });

    const now = Date.now();

    if (now < queueBusyUntil) {
        return res.json({ 
            code: 160, 
            retryIn: Math.ceil((queueBusyUntil - now) / 1000) 
        });
    }

    try {
        if (action === 'post' || action === 'edit') {
            const sizeMb = value ? (Buffer.byteLength(value, 'utf8') / 1048576) : 0;
            
            if (sizeMb > 2000) return res.json({ code: 340 });
            if (value && /hentai|porn|nsfw/i.test(value)) return res.json({ code: 230 });

            let lockoutMs = 3000;
            if (sizeMb > 100) {
                lockoutMs += (sizeMb * 1000); 
            }
            
            queueBusyUntil = now + lockoutMs;

            await client.sendMessage(channelId, { 
                message: `ENTRY_${id}_${item}\nDATA_START\n${value}\nDATA_END` 
            });
            return res.json({ code: 700, wait: lockoutMs });

        } else if (action === 'get') {
            const results = await client.getMessages(channelId, { 
                search: `ENTRY_${id}_${item}`, 
                limit: 1 
            });
            
            if (results && results.length > 0) {
                const parts = results[0].message.split("DATA_START\n");
                if (parts.length > 1) {
                    const finalValue = parts[1].split("\nDATA_END")[0];
                    return res.json({ value: finalValue, code: 700 });
                }
            }
            return res.json({ value: "Not Found", code: 700 });
        }
        res.json({ code: 170 });
    } catch (e) {
        res.json({ code: 190, error: e.message });
    }
});

app.get("/status", (req, res) => {
    const now = Date.now();
    res.json({ 
        code: client.connected ? 700 : 190,
        busy: now < queueBusyUntil,
        timeLeft: now < queueBusyUntil ? Math.ceil((queueBusyUntil - now) / 1000) : 0
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {});