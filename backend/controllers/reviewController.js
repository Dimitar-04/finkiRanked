const prisma = require('../lib/prisma');
const ForumPost = require('../models/ForumPost');
const ForumController = require('./forumController');
const filter = require('leo-profanity');
const safeWords = require('../filters/safeWords');

const createReviewPost = async (req, res) => {
  const { title, content, authorId, authorName } = req.body;

  try {
    // Create domain object first
    const post = new ForumPost({
      title,
      content,
      authorName,
    });
    const savedPost = await prisma.to_be_reviewed.create({
      data: {
        title: post.title,
        content: post.content,
        author_id: authorId,
        author_name: post.authorName,
      },
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getReviewPosts = async (req, res) => {
  try {
    console.log('Fetching to be reviewed posts ');
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const skip = page * limit;

    // Use Prisma to fetch posts with pagination
    const posts = await prisma.to_be_reviewed.findMany({
      skip,
      take: limit,
      orderBy: {
        date_created: 'desc',
      },
    });

    // Convert to domain objects
    const forumPosts = posts.map(
      (post) =>
        new ForumPost({
          id: post.id,
          title: post.title,
          content: post.content,
          authorName: post.author_name,
          dateCreated: post.date_created,
          commentCount: post.comment_count,
        })
    );

    res.status(200).json(forumPosts);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteReviewPost = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete using Prisma
    await prisma.to_be_reviewed.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    // Prisma throws when record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Forum post not found' });
    }
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveReviewPost = async (req, res) => {
  await ForumController.createForumPost(req, res);
  await deleteReviewPost(req, res);
};

module.exports = {
  createReviewPost,
  getReviewPosts,
  deleteReviewPost,
  approveReviewPost,
};
