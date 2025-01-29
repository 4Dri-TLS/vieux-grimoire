const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');


const stuffCtrl = require('../controllers/ctrl_stuff');


router.get('/', stuffCtrl.getAllStuff);
router.post('/', auth, multer, stuffCtrl.createThing);
router.put('/:id', auth, multer, stuffCtrl.modifyThing);
router.get('/:id', auth, stuffCtrl.getOneThing);
router.delete('/:id', auth, stuffCtrl.deleteThing);

module.exports = router;