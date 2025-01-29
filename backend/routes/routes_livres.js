const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const booksCtrl = require('../controllers/ctrl_livre');

router.post('/', auth, multer, booksCtrl.createBook);

module.exports = router;