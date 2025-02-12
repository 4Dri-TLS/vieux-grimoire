const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  userId: { type: String, required: true },
  ratings: [{ userId: String, grade: Number }], // Utilisation de grade au lieu de rating
  averageRating: { type: Number, default: 0 } // averageRating est maintenant stocké dans la base de données
});

module.exports = mongoose.model('Book', bookSchema);