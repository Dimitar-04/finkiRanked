const prisma = require('../lib/prisma');
const ForumPost = require('../models/ForumPost');
const ForumController = require('./forumController');
const filter = require("leo-profanity");
const safeWords = require("../filters/safeWords");


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

const getReviewPosts = async (req, res) => {
    try {
        console.log('Fetching to be reviewed posts');
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 5;
        const skip = page * limit;

        try {
            const posts = await prisma.to_be_reviewed.findMany({
                skip,
                take: limit,
                orderBy: {
                    created_at: 'desc',
                },
            });

            console.log("Found review posts:", posts.length);

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

            console.log("Formatted posts:", forumPosts.length);

            res.status(200).json(forumPosts);
        } catch (dbError) {
            console.error('Database query error:', dbError);
            res.status(500).json({ error: 'Error fetching posts from database' });
        }
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
    try {
        console.log('Approving review post', req.params.id);
        const { id } = req.params;
        
        // 1. Get the post to be approved
        const postToApprove = await prisma.to_be_reviewed.findUnique({
            where: { id }
        });
        
        if (!postToApprove) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // 2. Create a new forum post with the same data
        const newForumPost = await prisma.forum_posts.create({
            data: {
                title: postToApprove.title,
                content: postToApprove.content,
                author_id: postToApprove.author_id,
                author_name: postToApprove.author_name,
            },
        });
        
        // 3. Delete the post from to_be_reviewed
        await prisma.to_be_reviewed.delete({
            where: { id }
        });
        
        // 4. Send success response with the created post
        res.status(200).json({
            message: 'Post approved and published successfully',
            post: newForumPost
        });
    } catch (err) {
        console.error('Error approving post:', err);
        res.status(500).json({ error: 'Failed to approve post' });
    }
}

module.exports = {
    createReviewPost,
    getReviewPosts,
    deleteReviewPost,
    approveReviewPost
}