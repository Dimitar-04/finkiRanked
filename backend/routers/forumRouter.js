const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");

// Debug middleware for the posts route
router.use('/posts', (req, res, next) => {
  console.log('Forum request received:');
  console.log('  Query params:', req.query);
  console.log('  URL:', req.originalUrl);
  next();
});

router.post("/posts", forumController.createForumPost);
router.get("/posts", forumController.getForumPosts);
router.get("/user-posts", forumController.getAllPostsByUser);

router.delete("/posts/:id", forumController.deleteForumPost);

router.delete("/comments/:commentId", forumController.deleteComment);
router.post("/comments", forumController.createComment);
router.get("/comments/:postId", forumController.getComments);

module.exports = router;
