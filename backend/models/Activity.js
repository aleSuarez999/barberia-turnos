import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Barbershop', required: true },
  title: { type: String, required: true },
  description: { type: String },
  durationMinutes: { type: Number, required: true, default: 45 },
  price: { type: Number, required: true, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Activity', ActivitySchema);
