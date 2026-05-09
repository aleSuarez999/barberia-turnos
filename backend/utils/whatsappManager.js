import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

// shopId (string) → { client, status, qr }
const clients = new Map();

export function initClient(shopId) {
  if (clients.has(shopId)) return clients.get(shopId);

  const state = { client: null, status: 'connecting', qr: null };
  clients.set(shopId, state);

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'shop_' + shopId }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  });

  client.on('qr', (qr) => {
    state.status = 'qr';
    state.qr = qr;
    console.log(`[WA] QR generado para barbería ${shopId}`);
  });

  client.on('ready', () => {
    state.status = 'ready';
    state.qr = null;
    console.log(`[WA] ✅ Conectado para barbería ${shopId}`);
  });

  client.on('auth_failure', () => {
    state.status = 'disconnected';
    state.qr = null;
    console.warn(`[WA] ❌ Fallo de autenticación para barbería ${shopId}`);
  });

  client.on('disconnected', (reason) => {
    state.status = 'disconnected';
    state.qr = null;
    clients.delete(shopId);
    console.warn(`[WA] Desconectado barbería ${shopId}:`, reason);
  });

  state.client = client;
  client.initialize();
  return state;
}

export function getStatus(shopId) {
  return clients.get(shopId)?.status ?? 'disconnected';
}

export function getQR(shopId) {
  return clients.get(shopId)?.qr ?? null;
}

export async function send(shopId, phone, message) {
  const state = clients.get(shopId);
  if (!state || state.status !== 'ready') {
    throw new Error(`WhatsApp no conectado para barbería ${shopId}`);
  }
  const chatId = `${phone.replace(/\D/g, '')}@c.us`;
  await state.client.sendMessage(chatId, message);
}

export async function disconnect(shopId) {
  const state = clients.get(shopId);
  if (state?.client) {
    try { await state.client.destroy(); } catch (_) { /* ignore */ }
  }
  clients.delete(shopId);
}
