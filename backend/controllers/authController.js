import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Client from '../models/Client.js';

const createToken = (user) => {
  return jwt.sign(
    {
      uid: user._id,
      role: user.role || 'client',
      type: user.role ? 'admin' : 'client',
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await Admin.findOne({ username });
    let userType = 'admin';

    if (!user) {
      user = await Client.findOne({ username });
      userType = 'client';
    }

    if (!user) {
      return res.status(401).json({ ok: false, msg: 'Credenciales invalidas' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ ok: false, msg: 'Credenciales invalidas' });
    }

    const token = createToken(user);
    return res.json({
      ok: true,
      token,
      userType,
      role: user.role || 'client',
      name: user.name || user.username,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error en el login', error: error.message });
  }
};

export const registerClient = async (req, res) => {
  try {
    const { username, password, name, phone, email } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos requeridos' });
    }

    const existing = await Client.findOne({ username });
    if (existing) {
      return res.status(400).json({ ok: false, msg: 'El nombre de usuario ya existe' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const client = new Client({ username, password: hashed, name, phone, email });
    await client.save();

    return res.status(201).json({ ok: true, client: { id: client._id, username: client.username, name: client.name } });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error creando cliente', error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    if (req.role !== 'superadmin') {
      return res.status(403).json({ ok: false, msg: 'Solo el superadmin puede crear administradores' });
    }
    const { username, password, shop, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos requeridos' });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ ok: false, msg: 'El nombre de usuario ya existe' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const admin = new Admin({
      username,
      password: hashed,
      shop: shop || null,
      role: role || 'shopadmin',
    });
    await admin.save();
    return res.status(201).json({ ok: true, admin: { id: admin._id, username: admin.username, role: admin.role } });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error creando administrador', error: error.message });
  }
};

export const getAdmins = async (req, res) => {
  try {
    if (req.role !== 'superadmin') {
      return res.status(403).json({ ok: false, msg: 'Solo el superadmin puede ver administradores' });
    }
    const admins = await Admin.find().select('-password').populate('shop', 'name');
    res.json({ ok: true, admins });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error obteniendo administradores' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    if (req.role !== 'superadmin') {
      return res.status(403).json({ ok: false, msg: 'Solo el superadmin puede eliminar administradores' });
    }
    const { id } = req.params;
    await Admin.findByIdAndDelete(id);
    res.json({ ok: true, msg: 'Administrador eliminado' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error eliminando administrador' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    if (req.role !== 'superadmin') {
      return res.status(403).json({ ok: false, msg: 'Solo el superadmin puede editar administradores' });
    }
    const { id } = req.params;
    const { username, password, shop } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ ok: false, msg: 'Administrador no encontrado' });
    if (admin.role === 'superadmin') return res.status(403).json({ ok: false, msg: 'No se puede editar el superadmin' });

    if (username && username !== admin.username) {
      const exists = await Admin.findOne({ username, _id: { $ne: id } });
      if (exists) return res.status(400).json({ ok: false, msg: 'El nombre de usuario ya existe' });
      admin.username = username;
    }
    if (password) admin.password = bcrypt.hashSync(password, 10);
    if (shop !== undefined) admin.shop = shop || null;

    await admin.save();
    const updated = await Admin.findById(id).select('-password').populate('shop', 'name');
    return res.json({ ok: true, admin: updated });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error actualizando administrador', error: error.message });
  }
};
