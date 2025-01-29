const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const booksCtrl = require('../controllers/ctrl_livre');

router.get('/', booksCtrl.getAllBooks); 
router.post('/', auth, multer, booksCtrl.createBook);
// router.put('/:id', auth, multer, booksCtrl.modifyBook);
// router.get('/:id', auth, booksCtrl.getOneBook);
// router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;