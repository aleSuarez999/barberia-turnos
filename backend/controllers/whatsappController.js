import { initClient, getStatus, getQR, disconnect as waDisconnect } from '../utils/whatsappManager.js';

export const status = (req, res) => {
  const shopId = req.user?.shop?.toString();
  if (!shopId) return res.status(400).json({ ok: false, msg: 'Sin barbería asignada' });
  res.json({ ok: true, status: getStatus(shopId) });
};

export const connect = (req, res) => {
  const shopId = req.user?.shop?.toString();
  if (!shopId) return res.status(400).json({ ok: false, msg: 'Sin barbería asignada' });
  const state = initClient(shopId);
  res.json({ ok: true, status: state.status });
};

export const qr = (req, res) => {
  const shopId = req.user?.shop?.toString();
  if (!shopId) return res.status(400).json({ ok: false, msg: 'Sin barbería asignada' });
  const qrString = getQR(shopId);
  res.json({ ok: true, qr: qrString ?? null });
};

export const disconnectWA = async (req, res) => {
  const shopId = req.user?.shop?.toString();
  if (!shopId) return res.status(400).json({ ok: false, msg: 'Sin barbería asignada' });
  await waDisconnect(shopId);
  res.json({ ok: true });
};
