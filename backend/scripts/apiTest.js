const axios = require('axios');

async function testApi() {
  try {
    // Get a JWT token first (this is just a placeholder, you'll need to get a real token)
    const token = "your_jwt_token";
    
    // Make a request to the API with different filters
    console.log("Testing general posts filter...");
    const generalResponse = await axios.get('http://localhost:5001/forum/posts?page=0&limit=20&topic=general', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log(`Status: ${generalResponse.status}`);
    console.log(`Received ${generalResponse.data.length} general posts`);
    
    // Test daily challenge filter
    console.log("\nTesting daily challenge posts filter...");
    const challengeResponse = await axios.get('http://localhost:5001/forum/posts?page=0&limit=20&topic=daily-challenge', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log(`Status: ${challengeResponse.status}`);
    console.log(`Received ${challengeResponse.data.length} daily challenge posts`);
    
    // Output response headers to check for caching
    console.log("\nResponse headers:", challengeResponse.headers);
  } catch (error) {
    console.error("Error testing API:", error.message);
    if (error.response) {
      console.log("Response status:", error.response.status);
      console.log("Response data:", error.response.data);
    }
  }
}

console.log("This script would test the API endpoints directly, but it needs a valid JWT token.");
console.log("Instead, let's try a local test with the filter function...");

const forumController = require('../controllers/forumController');

// Mock Express request and response
const mockReq = (query) => ({ query });
const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log(`Status ${code}, returned ${data.length} posts`);
      console.log("Sample data:", data.slice(0, 2));
    }
  })
};

// Test the controller directly
async function testController() {
  console.log("\nTesting controller with topic=general:");
  await forumController.getForumPosts(
    mockReq({ page: 0, limit: 20, topic: 'general' }),
    mockRes
  );
  
  console.log("\nTesting controller with topic=daily-challenge:");
  await forumController.getForumPosts(
    mockReq({ page: 0, limit: 20, topic: 'daily-challenge' }),
    mockRes
  );
}

testController();
