const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();


const userRoutes = require('./routes/routes_user');
const booksRoutes = require('./routes/routes_livres'); 


mongoose.connect(process.env.BDD_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware
app.use(express.json()); 

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use('/images', express.static(path.join(__dirname, 'images')));

// API Routes
app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes);

module.exports = app;