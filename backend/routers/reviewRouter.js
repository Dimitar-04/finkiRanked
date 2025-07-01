const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.post("/posts/:id/:userId", reviewController.approveReviewPost);
router.get("/posts", reviewController.getReviewPosts);
router.post("/posts/approval", reviewController.createReviewPost);
router.delete("/posts/:id/:userId", reviewController.deleteReviewPost);

module.exports = router;
