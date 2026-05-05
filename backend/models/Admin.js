import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'shopadmin', enum: ['superadmin', 'shopadmin'] },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Barbershop' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Admin', AdminSchema);
