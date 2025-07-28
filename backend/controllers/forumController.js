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
const {
  sendDeletedFromForumEmail,
  sendDeletedCommentEmail,
  sendCommentedNotificationEmail,
} = require("../services/emailService");
const createForumPost = async (req, res) => {
  const { title, content, authorId, authorName, topic, challengeId } = req.body;
  if (!title || !content || !authorId || !authorName || !topic) {
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

    if (postCounter >= -11) {
      const post = new ForumPost({
        title,
        content,
        authorId,
        authorName,
        dateCreated: new Date(),
        topic: topic,
        challengeId: challengeId || null,
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
      const { author_id, challenge_id, ...data } = post;

      //Connect must be used becase multiple relations were introduced
      const savedPost = await prisma.forum_posts.create({
        data: {
          ...data,
          users: {
            connect: { id: author_id },
          },
          challenges: challenge_id
            ? { connect: { id: challenge_id } }
            : undefined,
        },
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
    console.log("Received query params:", req.query);
    console.log("Request URL:", req.originalUrl);

    // Extract parameters with strict type checking and debug output
    const page = req.query.page !== undefined ? parseInt(req.query.page) : 0;
    const limit =
      req.query.limit !== undefined ? parseInt(req.query.limit) : 20;

    // Topic needs special handling
    const topic = req.query.topic || null;
    console.log(`Topic parameter received: "${topic}"`);

    const sort = req.query.sort || null;
    const date = req.query.date || null;
    const commentSort = req.query.commentSort || null;
    const search = req.query.search || null;

    const skip = page * limit;
    const take = limit;

    // Build filter conditions
    const whereCondition = {};

    // Filter by topic if provided
    if (topic && topic !== "all") {
      try {
        const trimmedTopic = topic.trim();
        const dbPosts = await prisma.forum_posts.findMany({
          where: { topic: trimmedTopic },
          select: { id: true },
        });
        console.log(
          `DIRECT DB QUERY: Found ${dbPosts.length} posts with topic "${trimmedTopic}"`
        );

        // Set the correct topic filter
        whereCondition.topic = trimmedTopic;
      } catch (err) {
        console.error("Error in direct DB query:", err);
        // Fallback to original behavior
        whereCondition.topic = topic;
      }

      console.log("Final whereCondition.topic set to:", whereCondition.topic);
    }

    // Filter by specific date if provided
    if (date) {
      console.log(`Filtering by specific date: "${date}"`);

      try {
        // Create a date object from the provided date string
        const selectedDate = new Date(date);
        console.log("SELECTED DATE", selectedDate);

        // Ensure the date is valid
        if (isNaN(selectedDate.getTime())) {
          console.error(`Invalid date provided: "${date}"`);
        } else {
          // Set to beginning of the day (midnight)

          // Add to where condition
          whereCondition.date_created = selectedDate;
        }
      } catch (err) {
        console.error(`Error processing date filter "${date}":`, err);
      }
    }

    // Filter by search text if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      console.log(`Filtering by search text: "${searchTerm}"`);

      // Use Prisma's OR condition to search in both title and content
      // Case-insensitive search using contains with mode: 'insensitive'
      const searchCondition = {
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      };

      // If we already have other conditions, combine them with AND
      if (Object.keys(whereCondition).length > 0) {
        whereCondition.AND = [{ ...whereCondition }, searchCondition];

        // Clear the original conditions since they're now in AND
        Object.keys(whereCondition).forEach((key) => {
          if (key !== "AND") {
            delete whereCondition[key];
          }
        });
      } else {
        // If no other conditions, just use the search condition
        Object.assign(whereCondition, searchCondition);
      }

      console.log("Search condition applied:", JSON.stringify(searchCondition));
    }

    console.log("Using where condition:", JSON.stringify(whereCondition));

    // Determine ordering - using an array to support multiple sorting criteria
    let orderBy = [];

    // First, handle comment popularity sorting if specified
    if (commentSort === "most-popular") {
      console.log("Applying MOST popular sorting");
      orderBy.push({ comment_count: "desc" });

      // Add date as secondary sort to make results consistent
      orderBy.push({ date_created: "desc" });
      console.log(
        "Added secondary date sorting (newest first) for consistency"
      );
    } else if (commentSort === "least-popular") {
      console.log("Applying LEAST popular sorting");
      orderBy.push({ comment_count: "asc" });

      // Add date as secondary sort to make results consistent
      orderBy.push({ date_created: "desc" });
      console.log(
        "Added secondary date sorting (newest first) for consistency"
      );
    }
    // Only apply date sorting as primary sort if comment sorting isn't specified
    else {
      // Always apply date sorting (either as primary or secondary criterion)
      if (sort === "oldest") {
        console.log("Applying oldest first date sorting as primary criterion");
        orderBy.push({ date_created: "asc" });
      } else {
        console.log("Applying newest first date sorting as primary criterion");
        orderBy.push({ date_created: "desc" });
      }
    }

    console.log("Final sort order:", JSON.stringify(orderBy));
    const totalCount = await prisma.forum_posts.count({
      where: whereCondition,
    });

    // Fetch posts with filters
    const allPosts = await prisma.forum_posts.findMany({
      skip: skip,
      take: take,
      where: whereCondition,
      orderBy: orderBy,
      include: {
        challenges: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const forumPosts = allPosts.map((post) => ({
      ...post,
      challengeTitle: post.challenges?.title || null,
    }));

    // Enhanced debug output
    console.log(`Returning ${forumPosts.length} posts with filters:`, {
      whereCondition,
      orderBy,
      skip,
      take,
    });

    // Log topic distribution to help debug topic filtering issues
    if (topic && topic !== "all") {
      const topicsInResult = {};
      forumPosts.forEach((post) => {
        topicsInResult[post.topic] = (topicsInResult[post.topic] || 0) + 1;
      });

      console.log("TOPIC DISTRIBUTION IN RESULTS:", topicsInResult);

      // Check if filtering was successful
      const nonMatchingCount = forumPosts.filter(
        (post) => post.topic !== topic
      ).length;
      if (nonMatchingCount > 0) {
        console.warn(
          `WARNING: Found ${nonMatchingCount} posts with wrong topic in results!`
        );
      }
    }

    // Log sorting analysis to help with debugging
    if (forumPosts.length > 0) {
      // Comment count analysis for popularity sort debugging
      if (commentSort) {
        console.log("COMMENT COUNT ANALYSIS:");
        const counts = forumPosts.map((p) => p.comment_count);
        console.log(
          `- Min: ${Math.min(...counts)}, Max: ${Math.max(...counts)}`
        );
      }

      // Date sorting and filtering analysis
      console.log("DATE ANALYSIS:");
      const dates = forumPosts.map((p) => new Date(p.date_created).getTime());

      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        console.log(
          `- Posts date range: ${minDate.toISOString()} to ${maxDate.toISOString()}`
        );

        // If specific date filter was applied, verify it's working
        if (date) {
          const filterDate = new Date(date);
          filterDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(filterDate);
          nextDay.setDate(nextDay.getDate() + 1);

          console.log(
            `- Specific date filter: ${filterDate.toISOString()} to ${nextDay.toISOString()}`
          );

          // Check if all posts are within the filtered date range
          const postsInRange = forumPosts.filter((p) => {
            const postDate = new Date(p.date_created);
            return postDate >= filterDate && postDate < nextDay;
          });

          console.log(
            `- Posts matching date filter: ${postsInRange.length}/${forumPosts.length}`
          );

          if (postsInRange.length < forumPosts.length) {
            console.warn(
              "⚠️ WARNING: Some posts do not match the date filter!"
            );
          }
        }
      } else {
        console.log("- No posts to analyze dates");
      }

      // First three posts details
      console.log(
        `FIRST THREE POSTS:`,
        forumPosts.slice(0, 3).map((p) => ({
          id: p.id,
          topic: p.topic,
          comments: p.comment_count,
          date: new Date(p.date_created).toISOString().split("T")[0],
        }))
      );
    }

    // Set cache control headers to prevent caching
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    // Add response information to help debug the filtering
    res.set("X-Total-Posts", forumPosts.length.toString());
    res.set("X-Filter-Topic", topic || "none");
    res.set("X-Filter-Applied", JSON.stringify(whereCondition));
    res.set("X-Sort-Order", JSON.stringify(orderBy));

    console.log(
      `RESPONSE: Sending ${forumPosts.length} posts with filter:`,
      whereCondition
    );

    res.status(200).json({ forumPosts, totalCount });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPostsByUser = async (req, res) => {
  const userId = req.user.sub;
  try {
    const posts = await prisma.forum_posts.findMany({
      where: { author_id: userId },
      orderBy: {
        date_created: "desc",
      },
    });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts by user:", err);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
};

const deleteForumPost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub;

  try {
    const post = await prisma.forum_posts.findUnique({
      where: { id },
      select: {
        author_id: true,
        title: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    const isAuthor = post.author_id === userId;
    const isUserModerator = await verifyModeratorStatus(userId);

    if (!isAuthor && !isUserModerator) {
      return res.status(403).json({
        error: "You do not have permission to delete this post",
      });
    }

    await prisma.forum_posts.delete({ where: { id } });

    if (isUserModerator) {
      const author = await prisma.users.findUnique({
        where: { id: post.author_id },
        select: { email: true },
      });

      if (author && author.email) {
        await sendDeletedFromForumEmail(author.email, post.title);
      }
    }

    return res.status(204).send();
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

    const post = await prisma.forum_posts.findUnique({
      where: { id: post_id },
      select: { title: true, author_id: true },
    });

    const postAuthor = await prisma.users.findUnique({
      where: { id: post.author_id },
      select: { email: true },
    });

    comment.id = savedComment.id;
    if (post.author_id != authorId) {
      await sendCommentedNotificationEmail(
        postAuthor.email,
        post.title,
        authorName
      );
    }
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
      select: { post_id: true, author_id: true, content: true },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const post = await prisma.forum_posts.findUnique({
      where: { id: comment.post_id },
      select: { title: true },
    });

    if (!post) {
      return res
        .status(404)
        .json({ error: "Post associated with comment not found" });
    }

    const isUserModerator = await verifyModeratorStatus(userId);
    const isAuthor = comment.author_id === userId;

    if (!isUserModerator && !isAuthor) {
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

    if (isUserModerator) {
      const author = await prisma.users.findUnique({
        where: { id: comment.author_id },
        select: { email: true },
      });
      if (author && author.email) {
        await sendDeletedCommentEmail(
          author.email,
          post.title,
          comment.content
        );
      }
    }

    return res.status(204).send();
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
  getAllPostsByUser,

  deleteForumPost,
  createComment,
  getComments,

  deleteComment,
  resetPostCheckCoutner,
};
