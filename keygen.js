const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

// Using the official Telegram Desktop sample keys
const apiId = 2040; 
const apiHash = "b18441a1ff46513830959ff7a26ad0a4"; 
const stringSession = new StringSession("");

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    
    await client.start({
        phoneNumber: async () => await input.text("Phone (+91...): "),
        password: async () => await input.text("2FA Password: "),
        phoneCode: async () => await input.text("Code: "),
        onError: (err) => console.log(err),
    });

    console.log("\n🔑 --- PROSTORAGE MASTER SESSION KEY --- 🔑");
    console.log(client.session.save());
    console.log("-----------------------------------------\n");
    
    await client.disconnect();
    process.exit();
})();