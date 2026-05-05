import Activity from '../models/Activity.js';

export const getActivities = async (req, res) => {
  try {
    const shop = req.user?.shop || req.query.shop;
    const filter = shop ? { shop } : {};
    const activities = await Activity.find(filter).sort('title');
    res.json({ ok: true, activities });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error obteniendo actividades' });
  }
};

export const createActivity = async (req, res) => {
  try {
    if (req.userType !== 'admin') {
      return res.status(403).json({ ok: false, msg: 'Solo administradores pueden crear actividades' });
    }
    const { title, description, durationMinutes, price, shop } = req.body;
    const activity = new Activity({
      shop: shop || req.user.shop,
      title,
      description,
      durationMinutes,
      price,
    });
    await activity.save();
    res.status(201).json({ ok: true, activity });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error creando actividad' });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findByIdAndUpdate(id, req.body, { new: true });
    if (!activity) {
      return res.status(404).json({ ok: false, msg: 'Actividad no encontrada' });
    }
    res.json({ ok: true, activity });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error actualizando actividad' });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    await Activity.findByIdAndDelete(id);
    res.json({ ok: true, msg: 'Actividad eliminada' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error eliminando actividad' });
  }
};
