const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();

// Import Routes
const userRoutes = require('./routes/routes_user');
const booksRoutes = require('./routes/routes_livres'); // Renamed for clarity

// Connect to MongoDB
mongoose.connect(process.env.BDD_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware
app.use(express.json()); // Parses JSON request bodies

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Static Files
app.use('/images', express.static(path.join(__dirname, 'images')));

// Register API Routes
app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes); // Corrected route path

module.exports = app;