const mongoose = require('mongoose');

// MONGODB_URI é o nome oficial (README, .env.example, createAdmin).
// MONGO_URI continua aceito por compatibilidade com .env antigos.
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dsmconecta';
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
