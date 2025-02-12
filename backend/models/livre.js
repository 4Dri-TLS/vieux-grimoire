const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  userId: { type: String, required: true },
  ratings: [{ userId: String, rating: Number }]
});

module.exports = mongoose.model('Book', bookSchema);