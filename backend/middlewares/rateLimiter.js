const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // ⛔ Limite chaque IP à 10 requetes par session
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    headers: true, // Ajoute des en-têtes aux réponses
    standardHeaders: true, // RFC standard headers
    legacyHeaders: false // Désactive les en-têtes legacy
});

module.exports = limiter;