const express = require('express');
const userRoutes = require('./routes/routes_user');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');

const app = express();

const mongoose = require('mongoose'); //Import du package mongoose

app.use(express.json()); //sert à transformer le corps de la requête en objet JS utilisable


const stuffRoutes = require('./routes/routes_stuff');
const bodyParser = require('body-parser');





mongoose.connect(process.env.BDD_URL,
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


//Middleware qui ajoute des headers à l'objet réponse pour éviter les erreurs de CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/stuff', stuffRoutes);
app.use(bodyParser.json());


module.exports = app;