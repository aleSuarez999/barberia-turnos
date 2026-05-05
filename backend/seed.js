import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from './models/Admin.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB:', mongoose.connection.name);

  const exists = await Admin.findOne({ username: 'admin' });
  if (exists) {
    console.log('El superadmin ya existe. Nada que hacer.');
    process.exit(0);
  }

  const hashed = bcrypt.hashSync('admin', 10);
  await Admin.create({ username: 'admin', password: hashed, role: 'superadmin' });
  console.log('Superadmin creado: usuario=admin / clave=admin');
  console.log('IMPORTANTE: Cambia la clave desde el panel una vez que ingreses.');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
