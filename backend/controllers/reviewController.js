const prisma = require("../lib/prisma");
const ToBeReviewedPost = require("../models/ToBeReviewedPost");
const ForumPost = require("../models/ForumPost");
const ForumController = require("./forumController");
const filter = require("leo-profanity");
const safeWords = require("../filters/safeWords");
const verifyModeratorStatus = require("../services/checkModeratorStatus");
const {
  sendApprovalEmail,
  sendDeletionEmail,
} = require("../services/emailService");

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
    await prisma.to_be_reviewed.create({
      data: post,
    });
    await resetPostCheckCoutner(authorId);
    return res.status(201).json({
      message: "Post submitted for moderator approval",
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
async function resetPostCheckCoutner(userId) {
  try {
    await prisma.users.update({
      where: { id: userId },
      data: {
        postCheckCounter: 0,
      },
    });
  } catch (error) {
    console.error(
      `Failed to decrement post counter for user ${userId}:`,
      error
    );
  }
}

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

const getPendingPosts = async (req, res) => {
  try {
    const userId = req.user.sub;
    console.log(userId);
    const pendingPosts = await prisma.to_be_reviewed.findMany({
      where: {
        author_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    console.log(pendingPosts);
    res.status(200).json(pendingPosts);
  } catch (err) {
    console.error("Error fetching user's pending posts:", err);
    res.status(500).json({ error: "Failed to fetch pending posts" });
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
    const post = await prisma.to_be_reviewed.findUnique({
      where: { id },
    });
    const author = await prisma.users.findUnique({
      where: { id: post.author_id },
      select: { email: true },
    });
    await prisma.to_be_reviewed.delete({
      where: { id },
    });

    if (author && author.email) {
      sendDeletionEmail(author.email, post.title);
    }

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

    const author = await prisma.users.findUnique({
      where: { id: postToApprove.author_id },
      select: { email: true },
    });
    if (!author || !author.email) {
      console.error(
        `Could not find email for author with ID: ${postToApprove.author_id}`
      );
    }

    const newForumPost = new ForumPost({
      id: postToApprove.id,
      title: postToApprove.title,
      content: postToApprove.content,
      authorName: postToApprove.author_name,
      authorId: postToApprove.author_id,
      dateCreated: postToApprove.created_at,
      commentCount: postToApprove.comment_count || 0,
    });

    await prisma.forum_posts.create({
      data: newForumPost,
    });

    await prisma.to_be_reviewed.delete({
      where: { id },
    });
    if (author && author.email) {
      sendApprovalEmail(author.email, newForumPost.title);
    }

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
  getPendingPosts,
};
