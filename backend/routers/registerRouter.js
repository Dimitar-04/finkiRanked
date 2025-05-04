const { Router } = require('express');
const router = Router();
const path = require('path');

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

module.exports = router;
