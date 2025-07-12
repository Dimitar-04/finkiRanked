const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");

router.post("/posts", forumController.createForumPost);
router.get("/posts", forumController.getForumPosts);
router.get("/user-posts", forumController.getAllPostsByUser);

router.delete("/posts/:id", forumController.deleteForumPost);

router.delete("/comments/:commentId", forumController.deleteComment);
router.post("/comments", forumController.createComment);
router.get("/comments/:postId", forumController.getComments);

module.exports = router;
