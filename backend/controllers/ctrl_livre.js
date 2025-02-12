const Book = require('../models/livre');
const fs = require('fs');

// Créer un nouveau livre (tableau de classement par défaut inclus)
exports.createBook = (req, res, next) => {
  let bookObject;

  if (req.file) {
    try {
      bookObject = JSON.parse(req.body.book);
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON format in 'book'" });
    }
  } else if (req.body.title && req.body.author) {
    bookObject = req.body;
  } else {
    return res.status(400).json({ error: "Invalid request format" });
  }

  delete bookObject._id;
  delete bookObject._userId;

  // s'assure que les notes sont un tableau
  let ratings = bookObject.ratings && Array.isArray(bookObject.ratings) ? bookObject.ratings : [];

  // Calcule la note moyenne
  const totalRatings = ratings.length;
  const totalScore = totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.grade, 0) : 0;
  const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    ratings, // Stocke les notes
    averageRating, // Stocke la note moyenne
    imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : '',
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Book created successfully!', book }))
    .catch(error => res.status(400).json({ error }));
};


// Recherche d'un seul livre (s'assurer que les classements existent)
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ error: 'Livre non trouvé' });

      // Recalcul du score moyen
      const totalRatings = book.ratings.length;
      const totalScore = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

      res.status(200).json({
        ...book.toObject(),
        ratings: book.ratings || [],
        averageRating
      });
    })
    .catch(error => res.status(500).json({ error }));
};


// Rechercher tous les livres (Inclure les notes)
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => {
      const booksWithRatings = books.map(book => ({
        ...book.toObject(),
        ratings: book.ratings || []
      }));
      res.status(200).json(booksWithRatings);
    })
    .catch(error => res.status(400).json({ error }));
};


// Modifier un livre (conserver les notes existantes)
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
    : { ...req.body };

  delete bookObject._userId;


// Recherche du livre 
Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      Book.updateOne({ _id: req.params.id }, { ...bookObject, ratings: book.ratings, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Book updated!' }))
        .catch(error => res.status(401).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
};


// Suppression d'un livre et de sa note
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Book deleted!' }))
          .catch(error => res.status(401).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};


// Donne les 3 meilleurs livres avec la note moyenne la plus élevée
exports.getBestRating = (req, res, next) => {
  Book.find()
    .then(books => {
      const booksWithAverageRating = books
        .map(book => {
          const ratings = book.ratings || [];
          const avgRating =
            ratings.length > 0
              ? ratings.reduce((sum, r) => sum + r.grade, 0) / ratings.length
              : 0;
          return { ...book.toObject(), averageRating: avgRating };
        })
        .sort((a, b) => b.averageRating - a.averageRating) // classement descendant
        .slice(0, 3); // recupère les 3 premiers

      res.status(200).json(booksWithAverageRating);
    })
    .catch(error => res.status(500).json({ error }));
};


// Ajout de la fonction rateBook pour noter un livre
exports.rateBook = (req, res, next) => {
  const { userId, grade } = req.body;

  if (!userId || grade === undefined || grade < 1 || grade > 5) {
    return res.status(400).json({ error: 'Invalid rating' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ error: 'Book not found' });

      const existingRating = book.ratings.find(r => r.userId === userId);

      if (existingRating) {
        return res.status(400).json({ error: 'User has already rated this book' });
      }

      book.ratings.push({ userId, grade }); // Stocké correctement

      // Recalcule la note moyenne
      const totalRatings = book.ratings.length;
      const totalScore = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      book.averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

      book.save()
        .then(() => res.status(200).json({ message: 'Rating added!', book }))
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};