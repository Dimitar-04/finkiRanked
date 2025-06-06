const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

// Forum Post Routes
router.post('/posts', forumController.createForumPost);
router.get('/posts', forumController.getForumPosts);
router.put('/posts/:id', forumController.updateForumPost);
router.delete('/posts/:id', forumController.deleteForumPost);

// Comment Routes
router.post('/posts/:postId/comments', forumController.createComment);
router.get('/posts/:postId/comments', forumController.getComments);
router.put('/comments/:commentId', forumController.updateComment);
router.delete('/comments/:commentId', forumController.deleteComment);

module.exports = router;