const { Router } = require('express');
const router = Router();
const path = require('path');
const apiController = require('../controllers/apiController');

router.post('/register', apiController.registerPOST);

module.exports = router;
