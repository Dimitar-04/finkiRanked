const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.post("/posts/:id/:userId", reviewController.approveReviewPost);
router.get("/posts", reviewController.getReviewPosts);
router.get("/pendingPosts", reviewController.getPendingPosts);
router.post("/posts/approval", reviewController.createReviewPost);
router.put("/posts/approval/:userId", reviewController.resetCheckCounter);
router.delete("/posts/:id/:userId", reviewController.deleteReviewPost);

module.exports = router;
