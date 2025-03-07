const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // Fenêtre temporelle se reset toutes les 10 minutes
    max: 10, // Limite chaque IP à 10 requetes par Fenêtre temporelle
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    headers: true, // Active l'ajout d'en-têtes de limitation de requêtes
    standardHeaders: true, // Utilise les en-têtes conformes aux standards RFC 
    legacyHeaders: false // Supprime les anciens en-têtes "X-RateLimit"
});

module.exports = limiter;