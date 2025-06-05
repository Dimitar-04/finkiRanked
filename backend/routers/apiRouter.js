const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.post('/register', apiController.registerPOST);
router.post('/login', apiController.loginPOST);

module.exports = router;
