const Book = require('../models/livre');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  let bookObject;
console.log(req.file);
  if (req.file) {
    try {
      bookObject = JSON.parse(req.body.book); 
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON format in 'book'" });
    }
  } 
  else if (req.body.title && req.body.author) {
    bookObject = req.body;
  } 
  else {
    return res.status(400).json({ error: "Invalid request format" });
  }

  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : '',
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Book created successfully!' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
      .then((book) => {
          if (book.userId != req.auth.userId) {
              return res.status(401).json({ message: 'Not authorized' });
          }
          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Book updated!' }))
              .catch(error => res.status(401).json({ error }));
      })
      .catch(error => res.status(400).json({ error }));
};

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

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};