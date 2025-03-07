const express = require('express');
const router = express.Router();

const rateLimiter = require('../middlewares/rateLimiter');
const userCtrl = require('../controllers/ctrl_user');

router.post('/signup', rateLimiter, userCtrl.signup);
router.post('/login', rateLimiter, userCtrl.login);

module.exports = router;