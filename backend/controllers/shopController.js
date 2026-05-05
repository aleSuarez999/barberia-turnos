import Barbershop from '../models/Barbershop.js';

export const getShops = async (req, res) => {
  try {
    const filter = req.role === 'superadmin' ? {} : { _id: req.user.shop };
    const shops = await Barbershop.find(filter).sort('name');
    res.json({ ok: true, shops });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error obteniendo barberias' });
  }
};

export const createShop = async (req, res) => {
  try {
    if (req.role !== 'superadmin') {
      return res.status(403).json({ ok: false, msg: 'Solo el superadmin puede crear barberias' });
    }
    const { name, slug, cuit, address, phone, whatsappNumber, mercadopagoEnabled } = req.body;
    const image = req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : undefined;
    const logo = req.files?.logo?.[0] ? `/uploads/${req.files.logo[0].filename}` : undefined;
    const shop = new Barbershop({ name, slug: slug || undefined, cuit, address, phone, whatsappNumber, mercadopagoEnabled, image, logo });
    await shop.save();
    res.status(201).json({ ok: true, shop });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error creando barberia' });
  }
};

export const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.role !== 'superadmin' && req.user.shop?.toString() !== id) {
      return res.status(403).json({ ok: false, msg: 'Sin permisos para esta barberia' });
    }
    const { name, slug, cuit, address, phone, whatsappNumber, active, mercadopagoEnabled } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug || null;
    if (cuit !== undefined) updates.cuit = cuit;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber;
    if (active !== undefined) updates.active = active;
    if (mercadopagoEnabled !== undefined) updates.mercadopagoEnabled = mercadopagoEnabled;
    if (req.files?.image?.[0]) updates.image = `/uploads/${req.files.image[0].filename}`;
    if (req.files?.logo?.[0]) updates.logo = `/uploads/${req.files.logo[0].filename}`;

    const shop = await Barbershop.findByIdAndUpdate(id, updates, { new: true });
    if (!shop) {
      return res.status(404).json({ ok: false, msg: 'Barberia no encontrada' });
    }
    res.json({ ok: true, shop });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error actualizando barberia' });
  }
};

export const deleteShop = async (req, res) => {
  try {
    if (req.role !== 'superadmin') {
      return res.status(403).json({ ok: false, msg: 'Solo el superadmin puede eliminar barberias' });
    }
    const { id } = req.params;
    await Barbershop.findByIdAndDelete(id);
    res.json({ ok: true, msg: 'Barberia eliminada' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error eliminando barberia' });
  }
};

export const togglePayment = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.role !== 'superadmin' && req.user.shop?.toString() !== id) {
      return res.status(403).json({ ok: false, msg: 'Sin permisos para esta barberia' });
    }
    const shop = await Barbershop.findById(id);
    if (!shop) {
      return res.status(404).json({ ok: false, msg: 'Barberia no encontrada' });
    }
    shop.mercadopagoEnabled = !shop.mercadopagoEnabled;
    await shop.save();
    res.json({ ok: true, shop });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error cambiando el metodo de pago' });
  }
};
