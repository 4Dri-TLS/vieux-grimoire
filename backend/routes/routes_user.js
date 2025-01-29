const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/ctrl_user');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;