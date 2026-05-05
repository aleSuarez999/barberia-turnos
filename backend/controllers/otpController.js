import Otp from '../models/Otp.js';
import Client from '../models/Client.js';
import Reservation from '../models/Reservation.js';
import Barber from '../models/Barber.js';
import Activity from '../models/Activity.js';
import Barbershop from '../models/Barbershop.js';
import { sendWhatsApp } from '../utils/whatsappClient.js';

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// Verifica si el cliente ya existe. Si es nuevo, envía OTP.
export const sendOtp = async (req, res) => {
  try {
    const { phone, name, email } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ ok: false, msg: 'Nombre y celular son obligatorios' });
    }

    const existing = await Client.findOne({ phone });
    if (existing) {
      // Cliente conocido → no necesita OTP
      return res.json({ ok: true, clientExists: true });
    }

    // Cliente nuevo → generar y enviar OTP
    const code = generateCode();
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, code, name, email });

    await sendWhatsApp(phone, `*Codigo de verificacion*\n\nHola ${name}! Tu codigo es: *${code}*\n\nValido por 10 minutos.`);

    res.json({ ok: true, clientExists: false });
  } catch (error) {
    console.error('sendOtp error:', error);
    res.status(500).json({ ok: false, msg: 'Error enviando codigo. Verifica que el numero sea correcto.' });
  }
};

// Para clientes NUEVOS: valida OTP + crea cliente + crea turno
export const verifyAndBook = async (req, res) => {
  try {
    const { phone, code, shopSlug, barberId, activityId, date, time, notes } = req.body;

    if (!phone || !code || !shopSlug || !barberId || !activityId || !date || !time) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos para confirmar el turno' });
    }

    const otp = await Otp.findOne({ phone });
    if (!otp) {
      return res.status(400).json({ ok: false, msg: 'El codigo expiro o no existe. Solicitá uno nuevo.' });
    }
    if (otp.code !== String(code)) {
      return res.status(400).json({ ok: false, msg: 'Codigo incorrecto' });
    }

    await Otp.deleteMany({ phone });

    const client = await Client.create({ name: otp.name, phone, email: otp.email || '' });

    return await _createReservation({ client, shopSlug, barberId, activityId, date, time, notes, res });
  } catch (error) {
    console.error('verifyAndBook error:', error);
    res.status(500).json({ ok: false, msg: 'Error confirmando el turno' });
  }
};

// Para clientes EXISTENTES: crea el turno directamente sin OTP
export const bookExisting = async (req, res) => {
  try {
    const { phone, shopSlug, barberId, activityId, date, time, notes } = req.body;

    if (!phone || !shopSlug || !barberId || !activityId || !date || !time) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos para reservar' });
    }

    const client = await Client.findOne({ phone });
    if (!client) {
      return res.status(400).json({ ok: false, msg: 'Cliente no encontrado' });
    }

    return await _createReservation({ client, shopSlug, barberId, activityId, date, time, notes, res });
  } catch (error) {
    console.error('bookExisting error:', error);
    res.status(500).json({ ok: false, msg: 'Error creando el turno' });
  }
};

async function _createReservation({ client, shopSlug, barberId, activityId, date, time, notes, res }) {
  const [barber, activity, shop] = await Promise.all([
    Barber.findById(barberId),
    Activity.findById(activityId),
    Barbershop.findOne({ slug: shopSlug.toLowerCase() }),
  ]);

  if (!barber || !activity || !shop) {
    return res.status(400).json({ ok: false, msg: 'Datos de reserva invalidos' });
  }

  const conflict = await Reservation.findOne({ barber: barberId, date, time, status: { $ne: 'cancelled' } });
  if (conflict) {
    return res.status(409).json({ ok: false, msg: 'Ese horario ya fue tomado. Elegí otro.' });
  }

  const reservation = await Reservation.create({
    shop: shop._id,
    barber: barberId,
    activity: activityId,
    client: client._id,
    date,
    time,
    notes,
    status: 'pending',
  });

  const populated = await reservation.populate([
    { path: 'barber', select: 'name whatsapp' },
    { path: 'activity', select: 'title price' },
    { path: 'client', select: 'name phone' },
  ]);

  const confirmMsg =
    `*TURNO RESERVADO ✂*\n\n` +
    `Hola ${client.name}!\n` +
    `Tu turno en *${shop.name}* fue registrado.\n\n` +
    `📋 Servicio: ${activity.title}\n` +
    `💈 Barbero: ${barber.name}\n` +
    `📅 Fecha: ${date}\n` +
    `⏰ Hora: ${time}\n\n` +
    `Te esperamos!`;

  sendWhatsApp(client.phone, confirmMsg).catch((e) => console.warn('WA confirmacion error:', e));

  return res.status(201).json({ ok: true, reservation: populated });
}
