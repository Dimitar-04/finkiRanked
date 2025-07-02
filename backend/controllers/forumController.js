const prisma = require("../lib/prisma");
const ForumPost = require("../models/ForumPost");
const Comment = require("../models/Comment");
const filter = require("leo-profanity");
const mkProfanity = require("../filters/macedonianProfanity");
filter.add(mkProfanity);
const safeWords = require("../filters/safeWords");
const { analyzePostContent } = require("../ai/processRequestAi");
const { createReviewPost } = require("./reviewController");
const verifyModeratorStatus = require("../services/checkModeratorStatus");

const createForumPost = async (req, res) => {
  const { title, content, authorId, authorName } = req.body;
  if (!title || !content || !authorId || !authorName) {
    return res.status(400).json({
      error: "Title, content, authorId, and authorName are required",
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: authorId },
    });
    const postCounter = user.postCounter;
    const postCheckCounter = user.postCheckCounter;

    if (postCheckCounter >= -11) {
      const post = new ForumPost({
        title,
        content,
        authorId,
        authorName,
        dateCreated: new Date(),
      });

      const isProfane = filter.check(post.title);

      if (isProfane) {
        return res.status(400).json({
          error: "Content contains inappropriate language",
        });
      } else if (filter.check(post.content)) {
        return res.status(400).json({
          error: "Content contains inappropriate language",
        });
      } else if (post.content.length > 200) {
        try {
          await createReviewPost(req, res);

          return;
        } catch (reviewError) {
          console.error("Error submitting post for review:", reviewError);
          return res.status(500).json({
            error:
              reviewError.message ||
              "Failed to submit post for review due to an internal error.",
          });
        }
      } else if (postCheckCounter >= 3) {
        return res.status(202).json({
          message:
            "Would you like to send this post to moderator for approval?",
        });
      } else if (
        !(
          safeWords.includes(post.content.toLowerCase()) ||
          safeWords.includes(post.title.toLowerCase())
        ) &&
        !(safeWords.includes(post.content) || safeWords.includes(post.title))
      ) {
        try {
          const aiResponse = await analyzePostContent(post.title, post.content);
          if (aiResponse.aiResponse === "INAPPROPRIATE") {
            console.log("AI analysis says INAPPROPRIATE:", aiResponse.reason);
            await prisma.users.update({
              where: { id: authorId },
              data: {
                postCheckCounter: { increment: 1 },
              },
            });
            return res.status(400).json({
              error: "Content is not appropriate for the forum",
            });
          }
        } catch (error) {
          console.error("AI analysis error:", error);
          return res.status(500).json({
            error: "AI analysis failed, please try again later",
          });
        }
      }
      const savedPost = await prisma.forum_posts.create({
        data: post,
      });

      post.id = savedPost.id;
      await decrementPostCounter(authorId);
      await resetPostCheckCoutner(authorId);
      res.status(201).json({
        message: "Forum post created successfully",
        post: savedPost,
      });
    } else {
      return res.status(400).json({
        error: "You have reached the daily limit for creating posts.",
      });
    }
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

async function decrementPostCounter(userId) {
  try {
    await prisma.users.update({
      where: { id: userId },
      data: {
        postCounter: { decrement: 1 },
      },
    });
  } catch (error) {
    console.error(
      `Failed to decrement post counter for user ${userId}:`,
      error
    );
  }
}

const getForumPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const skip = page * limit;

    const posts = await prisma.forum_posts.findMany({
      skip,
      take: limit,
      orderBy: {
        date_created: "desc",
      },
    });

    const forumPosts = posts.map(
      (post) =>
        new ForumPost({
          id: post.id,
          title: post.title,
          content: post.content,
          authorName: post.author_name,
          authorId: post.author_id,
          dateCreated: post.date_created,
          commentCount: post.comment_count,
        })
    );

    res.status(200).json(forumPosts);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteForumPost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  console.log(userId);

  try {
    const post = await prisma.forum_posts.findUnique({
      where: { id },
      select: {
        author_id: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    if (post.author_id === userId) {
      await prisma.forum_posts.delete({ where: { id } });
      return res.status(204).send();
    }

    const hasPermission = await verifyModeratorStatus(userId);
    if (!hasPermission) {
      return res.status(403).json({
        error: "You do not have permission to delete this post",
      });
    }
    await prisma.forum_posts.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Forum post not found" });
    }
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Comment Functions
const createComment = async (req, res) => {
  const { post_id, content, authorId, authorName } = req.body;

  if (!post_id || !content || !authorId || !authorName) {
    return res.status(400).json({
      error: "post_id, content, authorId, and authorName are required",
    });
  }

  try {
    const comment = new Comment({
      content: content,
      authorName: authorName,
      authorId: authorId,
      postId: post_id,
    });
    const profane = filter.check(comment.content);
    if (profane) {
      console.log("not safe words or profanity detected!");
      return res.status(400).json({
        error: "Content contains inappropriate language or is not on topic",
      });
    }

    const savedComment = await prisma.comments.create({
      data: comment,
    });
    await prisma.forum_posts.update({
      where: { id: post_id },
      data: { comment_count: { increment: 1 } },
    });

    comment.id = savedComment.id;

    res.status(201).json({
      message: "Comment created successfully",
      comment: savedComment,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getComments = async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res
      .status(400)
      .json({ error: "post_id query parameter is required" });
  }

  try {
    const dbComments = await prisma.comments.findMany({
      where: {
        post_id: postId,
      },
      orderBy: {
        dateCreated: "desc",
      },
    });

    const comments = dbComments.map(
      (comment) =>
        new Comment({
          id: comment.id,
          content: comment.content,
          authorName: comment.author_name,
          dateCreated: comment.dateCreated,
          authorId: comment.author_id,
        })
    );

    res.status(200).json(comments);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.sub;
  try {
    const comment = await prisma.comments.findUnique({
      where: { id: commentId },
      select: { post_id: true, author_id: true },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { isModerator: true },
    });
    if (comment.author_id !== userId && !(user && user.isModerator)) {
      return res.status(403).json({
        error: "You do not have permission to delete this comment",
      });
    }

    await prisma.comments.delete({
      where: { id: commentId },
    });

    if (comment.post_id) {
      await prisma.forum_posts.update({
        where: { id: comment.post_id },
        data: { comment_count: { decrement: 1 } },
      });
    }

    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Comment not found" });
    }
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createForumPost,
  getForumPosts,

  deleteForumPost,
  createComment,
  getComments,

  deleteComment,
  resetPostCheckCoutner,
};
