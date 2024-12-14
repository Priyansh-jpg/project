const mongoose = require('mongoose');
const football = async () => {
    try {
      const dbURI = "mongodb://localhost:27017/football"; // Use MONGO_URI from .env file
      await mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
   
      console.log('MongoDB connected successfully');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err.message);
      process.exit(1);
    }
  };
   
  module.exports = football;