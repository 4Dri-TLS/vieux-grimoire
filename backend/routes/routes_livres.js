const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const booksCtrl = require('../controllers/ctrl_livre');

router.get('/', booksCtrl.getAllBooks); // Accès public
router.get('/bestrating', booksCtrl.getBestRating); // Accès public
router.get('/:id', booksCtrl.getOneBook); // Accès public

router.post('/', auth, multer, booksCtrl.createBook); // Accès connecté
router.put('/:id', auth, multer, booksCtrl.modifyBook); // Accès connecté
router.delete('/:id', auth, booksCtrl.deleteBook); // Accès connecté
router.post('/:id/rating', auth, booksCtrl.rateBook); // Accès connecté

module.exports = router;