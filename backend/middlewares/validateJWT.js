import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Client from '../models/Client.js';

export const validateJWT = async (req, res, next) => {
  const token = req.header('x-token') || req.header('authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ ok: false, msg: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = payload.uid;
    req.role = payload.role;
    req.userType = payload.type;

    if (payload.type === 'admin') {
      req.user = await Admin.findById(payload.uid);
    } else {
      req.user = await Client.findById(payload.uid);
    }

    if (!req.user) {
      return res.status(401).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ ok: false, msg: 'Token inválido' });
  }
};
