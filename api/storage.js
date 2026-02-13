(function(Scratch) {
  'use strict';
  let lastTime = 0;
  let status = "700";
  const API = 'https://apiprostorage.vercel.app/api/storage';

  class ProStoragePro {
    getInfo() {
      return {
        id: 'prostoragepro',
        name: 'ProStorage Channel',
        color1: '#001eff',
        blocks: [
          { opcode: 'postK', blockType: Scratch.BlockType.COMMAND, text: 'channel save [V] to [I] ID [ID]', arguments: { V: { type: Scratch.ArgumentType.STRING, defaultValue: '100' }, I: { type: Scratch.ArgumentType.STRING, defaultValue: 'Score' }, ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'User1' } } },
          { opcode: 'getK', blockType: Scratch.BlockType.REPORTER, text: 'channel load [I] ID [ID]', arguments: { I: { type: Scratch.ArgumentType.STRING, defaultValue: 'Score' }, ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'User1' } } },
          { opcode: 'getS', blockType: Scratch.BlockType.REPORTER, text: 'server status' }
        ]
      };
    }

    async postK(a) { await this.req({ action: 'post', id: a.ID, item: a.I, value: a.V }); }
    
    async getK(a) { 
        try {
            const r = await fetch(`${API}?action=get&id=${a.ID}&item=${a.I}`);
            const d = await r.json();
            return d.value || "Not Found";
        } catch(e) { return "Error"; }
    }

    async req(b) {
      if (Date.now() - lastTime < 1500) { status = "460"; return; }
      lastTime = Date.now();
      try {
        const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
        status = String((await r.json()).code);
      } catch (e) { status = "580"; }
    }

    getS() { return status; }
  }
  Scratch.extensions.register(new ProStoragePro());
})(Scratch);