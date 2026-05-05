import mongoose from 'mongoose';

export const dbMongo = async () => {
  try {
    console.info('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.info('MongoDB conectado:', mongoose.connection.name);
  } catch (error) {
    console.error('Error conectando a MongoDB', error);
    throw error;
  }
};
