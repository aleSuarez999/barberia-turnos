import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  console.log('\n=== Escanea este QR con WhatsApp para conectar el servicio ===\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp conectado y listo');
});

client.on('auth_failure', () => {
  console.error('❌ Fallo de autenticacion WhatsApp — eliminá la carpeta .wwebjs_auth y reiniciá');
});

client.on('disconnected', (reason) => {
  console.warn('⚠️  WhatsApp desconectado:', reason);
});

client.initialize();

// phone: "5491100000000" (sin + ni espacios)
export const sendWhatsApp = async (phone, message) => {
  const chatId = `${phone.replace(/\D/g, '')}@c.us`;
  await client.sendMessage(chatId, message);
};

export default client;
