const prisma = require('../lib/prisma');
const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');

// Forum Post Functions
const createForumPost = async (req, res) => {
  const { title, content, authorId, authorName } = req.body;

  try {
    // Create domain object first
    const post = new ForumPost({
      title,
      content,
      authorName,
    });

    // Store in database using Prisma
    const savedPost = await prisma.forum_posts.create({
      data: {
        title: post.title,
        content: post.content,
        author_id: authorId,
        author_name: post.authorName,
      },
    });

    // Update the domain object with the generated ID
    post.id = savedPost.id;

    res.status(201).json({
      message: 'Forum post created successfully',
      post: savedPost,
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getForumPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const skip = page * limit;

    // Use Prisma to fetch posts with pagination
    const posts = await prisma.forum_posts.findMany({
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
        })
    );

    res.status(200).json(forumPosts);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateForumPost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    // Update using Prisma
    const updatedPost = await prisma.forum_posts.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    if (!updatedPost) {
      return res.status(404).json({ error: 'Forum post not found' });
    }

    // Create domain object from updated data
    const post = new ForumPost({
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      authorName: updatedPost.author_name,
      dateCreated: updatedPost.date_created,
    });

    res.status(200).json({
      message: 'Forum post updated successfully',
      post,
    });
  } catch (err) {
    // Prisma throws when record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Forum post not found' });
    }
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteForumPost = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete using Prisma
    await prisma.forum_posts.delete({
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

// Comment Functions
const createComment = async (req, res) => {
  // Accept post_id, content, authorId, authorName from body
  const { post_id, content, authorId, authorName } = req.body;

  if (!post_id || !content || !authorId || !authorName) {
    return res.status(400).json({ error: 'post_id, content, authorId, and authorName are required' });
  }

  try {
    // Create domain object first
    const comment = new Comment({
      content,
      authorName,
    });

    // Store in database using Prisma
    const savedComment = await prisma.comments.create({
      data: {
        post_id: post_id,
        content: comment.content,
        author_id: authorId,
        author_name: comment.authorName,
      },
    });

    // Update the domain object with the generated ID
    comment.id = savedComment.id;

    res.status(201).json({
      message: 'Comment created successfully',
      comment: savedComment,
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getComments = async (req, res) => {
  // Get post_id from query string
  const postId = req.query.post_id;

  if (!postId) {
    return res.status(400).json({ error: 'post_id query parameter is required' });
  }

  try {
    // Use Prisma to fetch comments
    const dbComments = await prisma.comments.findMany({
      where: {
        post_id: postId,
      },
      orderBy: {
        dateCreated: 'desc',
      },
    });

    // Convert to domain objects
    const comments = dbComments.map(
      (comment) =>
        new Comment({
          id: comment.id,
          content: comment.content,
          authorName: comment.author_name,
          dateCreated: comment.date_created,
        })
    );

    res.status(200).json(comments);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    // Update using Prisma
    const updatedComment = await prisma.comments.update({
      where: { id: commentId },
      data: { content },
    });

    // Create domain object from updated data
    const comment = new Comment({
      id: updatedComment.id,
      content: updatedComment.content,
      authorName: updatedComment.author_name,
      dateCreated: updatedComment.dateCreated,
    });

    res.status(200).json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Comment not found' });
    }
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    // Delete using Prisma
    await prisma.comments.delete({
      where: { id: commentId },
    });

    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Comment not found' });
    }
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createForumPost,
  getForumPosts,
  updateForumPost,
  deleteForumPost,
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
