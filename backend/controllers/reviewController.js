const prisma = require("../lib/prisma");
const ToBeReviewedPost = require("../models/ToBeReviewedPost");
const ForumPost = require("../models/ForumPost");
const ForumController = require("./forumController");
const filter = require("leo-profanity");
const safeWords = require("../filters/safeWords");
const verifyModeratorStatus = require("../services/checkModeratorStatus");
const createReviewPost = async (req, res) => {
  const { title, content, authorId, authorName } = req.body;

  try {
    const post = new ToBeReviewedPost({
      title,
      content,
      authorId,
      authorName,
      dateCreated: new Date(),
    });
    const savedPost = await prisma.to_be_reviewed.create({
      data: post,
    });
    return res.status(201).json({
      message: "Post submitted for moderator approval",
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getReviewPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const skip = page * limit;
    const userId = req.query.userId;
    const hasModeratorStatus = await verifyModeratorStatus(userId);
    if (!hasModeratorStatus) {
      return res.status(403).json({
        error: "Access denied. Only moderators can access review posts.",
      });
    }
    try {
      const posts = await prisma.to_be_reviewed.findMany({
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      });

      const forumPosts = posts.map(
        (post) =>
          new ForumPost({
            id: post.id,
            title: post.title,
            content: post.content,
            authorName: post.author_name,
            dateCreated: post.created_at,
            commentCount: post.comment_count || 0,
          })
      );

      res.status(200).json(forumPosts);
    } catch (dbError) {
      console.error("Database query error:", dbError);
      res.status(500).json({ error: "Error fetching posts from database" });
    }
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteReviewPost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.params;
  const hasModeratorStatus = await verifyModeratorStatus(userId);
  if (!hasModeratorStatus) {
    console.log("Access denied: User is not a moderator");
    return res.status(403).json({
      error: "Access denied. Only moderators can access review posts.",
    });
  }
  try {
    await prisma.to_be_reviewed.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Forum post not found" });
    }
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const approveReviewPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.params;

    const hasModeratorStatus = await verifyModeratorStatus(userId);

    if (!hasModeratorStatus) {
      console.log("Access denied: User is not a moderator");
      return res.status(403).json({
        error: "Access denied. Only moderators can access review posts.",
      });
    }

    const postToApprove = await prisma.to_be_reviewed.findUnique({
      where: { id },
    });

    if (!postToApprove) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newForumPost = await prisma.forum_posts.create({
      data: {
        title: postToApprove.title,
        content: postToApprove.content,
        author_id: postToApprove.author_id,
        author_name: postToApprove.author_name,
      },
    });

    await prisma.to_be_reviewed.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Post approved and published successfully",
      post: newForumPost,
    });
  } catch (err) {
    console.error("Error approving post:", err);
    res.status(500).json({ error: "Failed to approve post" });
  }
};

module.exports = {
  createReviewPost,
  getReviewPosts,
  deleteReviewPost,
  approveReviewPost,
};
