const prisma = require('../lib/prisma');
const ToBeReviewedPost = require('../models/ToBeReviewedPost');
const ForumPost = require('../models/ForumPost');
const ForumController = require('./forumController');
const filter = require('leo-profanity');
const safeWords = require('../filters/safeWords');
const verifyModeratorStatus = require('../services/checkModeratorStatus');
const { resetPostCheckCounter } = require('../services/forumCountersReset');
const {
  sendApprovalEmail,
  sendDeletionEmail,
  sendModeratorManyPendingPostsEmail,
} = require('../services/emailService');
const { equal } = require('assert');

const createReviewPost = async (req, res) => {
  const { title, content, authorId, authorName, topic, challengeId } = req.body;

  try {
    const post = new ToBeReviewedPost({
      title,
      content,
      authorId,
      authorName,
      dateCreated: new Date(),
      topic,
      challengeId,
    });
    const { author_id, challenge_id, ...data } = post;

    await prisma.to_be_reviewed.create({
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

    const pendingCount = await prisma.to_be_reviewed.count();

    if (pendingCount > 5) {
      const moderators = await prisma.users.findMany({
        where: { isModerator: true },
        select: { email: true },
      });

      if (moderators.length > 0) {
        const emailPromises = moderators.map((moderator) =>
          sendModeratorManyPendingPostsEmail(moderator.email, pendingCount)
        );
        await Promise.all(emailPromises);
      }
    }

    await resetPostCheckCounter(authorId);
    return res.status(201).json({
      message: 'Post submitted for moderator approval',
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const resetCheckCounter = async (req, res) => {
  try {
    const { userId } = req.params;
    await resetPostCheckCounter(userId);
    res.status(200).json({ message: 'Post check counter reset successfully' });
  } catch (e) {
    console.error('Error resetting post check counter:', e);
  }
};

const getReviewPosts = async (req, res) => {
  try {
    const {
      page = 0,
      limit = 5,
      search = '',
      date = '',
      topic = 'all',
      dateSort = 'newest',
    } = req.query;
    const skip = parseInt(page) * parseInt(limit);
    const userId = req.query.userId;
    const hasModeratorStatus = await verifyModeratorStatus(userId);
    if (!hasModeratorStatus) {
      return res.status(403).json({
        error: 'Access denied. Only moderators can access review posts.',
      });
    }
    try {
      const whereClause = {
        AND: [],
      };
      if (search) {
        whereClause.AND.push({
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { author_name: { contains: search, mode: 'insensitive' } },
          ],
        });
      }
      if (date) {
        // Create a start date (e.g., 2025-08-07T00:00:00.000Z)
        const startDate = new Date(date);
        // Create an end date for the next day
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        whereClause.AND.push({
          created_at: {
            gte: startDate, // Greater than or equal to the start of the day
            lt: endDate, // Less than the start of the next day
          },
        });
      }
      if (topic && topic !== 'all') {
        whereClause.AND.push({
          topic: {
            equals: topic,
          },
        });
      }

      const where = whereClause.AND.length > 0 ? whereClause : undefined;

      const [totalPosts, posts] = await prisma.$transaction([
        prisma.to_be_reviewed.count({ where }),
        prisma.to_be_reviewed.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: {
            created_at: dateSort === 'oldest' ? 'asc' : 'desc',
          },
          include: {
            challenges: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalPosts / parseInt(limit));
      const reviewPosts = posts.map((post) => ({
        ...post,
        challengeTitle: post.challenges?.title,
      }));
      res.status(200).json({ posts: reviewPosts, totalPages });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      res.status(500).json({ error: 'Error fetching posts from database' });
    }
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPendingPosts = async (req, res) => {
  try {
    const userId = req.user.sub;

    const pendingPosts = await prisma.to_be_reviewed.findMany({
      where: {
        author_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json(pendingPosts);
  } catch (err) {
    console.error("Error fetching user's pending posts:", err);
    res.status(500).json({ error: 'Failed to fetch pending posts' });
  }
};

const deleteReviewPost = async (req, res) => {
  const { id, userId } = req.params;

  try {
    const post = await prisma.to_be_reviewed.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Forum post not found' });
    }

    const isAuthor = post.author_id === userId;
    const isModerator = await verifyModeratorStatus(userId);

    if (!isAuthor && !isModerator) {
      console.log('Access denied: Not author or moderator');
      return res.status(403).json({
        error:
          'Access denied. Only the author or a moderator can delete this post.',
      });
    }

    const author = await prisma.users.findUnique({
      where: { id: post.author_id },
      select: { email: true },
    });

    await prisma.to_be_reviewed.delete({
      where: { id },
    });

    if (author?.email) {
      sendDeletionEmail(author.email, post.title);
    }

    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Forum post not found' });
    }
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveReviewPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.params;

    const hasModeratorStatus = await verifyModeratorStatus(userId);

    if (!hasModeratorStatus) {
      console.log('Access denied: User is not a moderator');
      return res.status(403).json({
        error: 'Access denied. Only moderators can access review posts.',
      });
    }

    const postToApprove = await prisma.to_be_reviewed.findUnique({
      where: { id },
    });

    if (!postToApprove) {
      return res.status(404).json({ error: 'Post not found' });
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
      dateCreated: new Date(),
      commentCount: postToApprove.comment_count || 0,
      topic: postToApprove.topic,
      challengeId: postToApprove.challenge_id,
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
      message: 'Post approved and published successfully',
      post: newForumPost,
    });
  } catch (err) {
    console.error('Error approving post:', err);
    res.status(500).json({ error: 'Failed to approve post' });
  }
};

module.exports = {
  createReviewPost,
  getReviewPosts,
  deleteReviewPost,
  approveReviewPost,
  getPendingPosts,
  resetCheckCounter,
};
