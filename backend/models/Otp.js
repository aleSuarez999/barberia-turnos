import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  name: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL 10 minutos
});

OtpSchema.index({ phone: 1 });

export default mongoose.model('Otp', OtpSchema);
