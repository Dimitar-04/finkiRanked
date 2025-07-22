const express = require('express');
const app = express();
const prisma = require('./backend/lib/prisma');

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Query params:', req.query);
  next();
});

// Test forum endpoint
app.get('/test-forum', async (req, res) => {
  try {
    const { topic } = req.query;
    
    // Create whereCondition based on topic
    const whereCondition = {};
    if (topic && topic !== 'all') {
      console.log(`Filtering by topic: "${topic}"`);
      whereCondition.topic = topic;
    }
    
    console.log('Where condition:', whereCondition);
    
    // Fetch posts with filter
    const posts = await prisma.forum_posts.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        topic: true
      }
    });
    
    console.log(`Found ${posts.length} posts`);
    
    // Set cache control headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5005;
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
