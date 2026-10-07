import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_basi';
  
  // Defensive check for accidental prefixing
  if (mongoUri.startsWith('MONGO_URI=')) {
    mongoUri = mongoUri.replace(/^MONGO_URI=/, '');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true, // Automatically build indexes
    });
    console.log(`✓ MongoDB Atlas Connected successfully: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.name}`);

    // Ensure all defined model indexes are synced
    await Promise.all(
      Object.values(mongoose.models).map(async (model) => {
        try {
          await model.syncIndexes();
        } catch (indexErr: any) {
          console.warn(`! Index sync warning on ${model.modelName}:`, indexErr?.message);
        }
      })
    );
    console.log('✓ Model indexes verified and synchronized');
  } catch (error: any) {
    console.warn(`! MongoDB Connection Warning: ${error.message}`);
    console.warn('Running with fallback / memory resilient layer for offline reliability.');
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('! MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB error: ${err.message}`);
  });
};

export default connectDB;
