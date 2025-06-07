const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review Routes

router.post('/posts/:id', reviewController.approveReviewPost);
router.get('/posts', reviewController.getReviewPosts);
router.delete('/posts/:id', reviewController.deleteReviewPost);

module.exports = router;