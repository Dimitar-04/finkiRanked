const supabase = require('../supabaseClient');

// Placeholder for forum post functions
const createForumPost = async (req, res) => {
  const { title, content, authorId, authorName } = req.body;

  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert([
        { title, content, author_id: authorId, author_name: authorName },
      ])
      .select();

    if (error) {
      console.error('Error creating forum post:', error);
      return res.status(500).json({ error: error.message });
    }

    res
      .status(201)
      .json({ message: 'Forum post created successfully', post: data[0] });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getForumPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const offset = page * limit;

    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .order('date_created', { ascending: false })
      .range(offset, offset + limit - 1); // Supabase range is inclusive

    if (error) {
      console.error('Error fetching forum posts:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateForumPost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .update({ title, content })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating forum post:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Forum post not found' });
    }

    res
      .status(200)
      .json({ message: 'Forum post updated successfully', post: data[0] });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteForumPost = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from('forum_posts').delete().eq('id', id);

    if (error) {
      console.error('Error deleting forum post:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(204).send(); // No content to send back on successful deletion
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Placeholder for comment functions
const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content, authorId, authorName } = req.body;

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          content,
          author_id: authorId,
          author_name: authorName,
        },
      ])
      .select();

    if (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: error.message });
    }

    res
      .status(201)
      .json({ message: 'Comment created successfully', comment: data[0] });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('date_created', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .select();

    if (error) {
      console.error('Error updating comment:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res
      .status(200)
      .json({ message: 'Comment updated successfully', comment: data[0] });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(204).send(); // No content to send back on successful deletion
  } catch (err) {
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
