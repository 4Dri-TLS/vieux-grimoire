const Book = require('../models/livre');
const fs = require('fs');

// Crée un nouveau livre (inclut un tableau de classement par défaut)
exports.createBook = (req, res, next) => {
  let bookObject;

  if (req.file) {
    try {
      bookObject = JSON.parse(req.body.book);
    } catch (error) {
      return res.status(400).json({ error: "Format JSON invalide dans 'book'" });
    }
  } else if (req.body.title && req.body.author) {
    bookObject = req.body;
  } else {
    return res.status(400).json({ error: "Format de requête invalide" });
  }

  delete bookObject._id;
  delete bookObject._userId;

  // Vérifie que les notes sont sous forme de tableau
  let ratings = bookObject.ratings && Array.isArray(bookObject.ratings) ? bookObject.ratings : [];

  // Calcule la note moyenne
  const totalRatings = ratings.length;
  const totalScore = totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.grade, 0) : 0;
  const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    ratings, 
    averageRating, 
    imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : '',
  });

  book.save()
    .then((savedBook) => res.status(201).json(savedBook)) // Renvoie directement le livre créé
    .catch(error => res.status(400).json({ error }));
};

// Recherche un livre unique
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ error: 'Livre non trouvé' });

      // Recalcule la note moyenne
      const totalRatings = book.ratings.length;
      const totalScore = book.ratings.reduce((sum, r) => sum + Math.round(r.grade), 0);
      const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

      res.status(200).json({
        ...book.toObject(),
        ratings: book.ratings || [],
        averageRating
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// Recherche tous les livres
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

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ error: 'Non autorisé' });
      }

      Book.updateOne({ _id: req.params.id }, { ...bookObject, ratings: book.ratings, _id: req.params.id })
        .then(() => res.status(200).json(bookObject)) // Retourne directement l'objet modifié
        .catch(error => res.status(401).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
};

// Suppression d'un livre
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });

    if (book.userId != req.auth.userId) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const filename = book.imageUrl.split('/images/')[1];
    if (filename) {
      try {
        await fs.promises.unlink(`images/${filename}`);
      } catch (unlinkErr) {
        console.error(`Erreur suppression image: ${unlinkErr.message}`);
      }
    }

    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Récupère les 3 meilleurs livres avec la meilleure note moyenne
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
        .sort((a, b) => b.averageRating - a.averageRating) 
        .slice(0, 3); 

      res.status(200).json(booksWithAverageRating);
    })
    .catch(error => res.status(500).json({ error }));
};

// Ajout d'une note à un livre
exports.rateBook = (req, res, next) => {
  const { userId, rating } = req.body; 
  const grade = rating; 

  if (!userId || grade === undefined || grade < 1 || grade > 5) {
    return res.status(400).json({ error: "Note invalide" });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ error: "Livre non trouvé" });

      const existingRating = book.ratings.find(r => r.userId === userId);
      if (existingRating) {
        return res.status(400).json({ error: "L'utilisateur a déjà noté ce livre" });
      }

      book.ratings.push({ userId, grade });

      const totalRatings = book.ratings.length;
      let totalScore = 0;

      for (const rating of book.ratings) {
        totalScore += rating.grade;
      }

      book.averageRating = totalRatings > 0 ? Math.round(totalScore / totalRatings) : 0;
      book.save()
        .then((updatedBook) => res.status(200).json(updatedBook)) // Retourne directement le livre mis à jour
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};