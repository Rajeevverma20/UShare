const dotenv = require("dotenv").config();
const mongoose = require('mongoose');

function connectDB() {
  // Database Connection
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
      useUnifiedTopology: true
  })

  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error);
  });
}

module.exports = connectDB;
