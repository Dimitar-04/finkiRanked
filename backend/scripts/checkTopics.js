const prisma = require("../lib/prisma");

async function main() {
  console.log("Checking all forum posts topics and values:");
  
  // Get all posts with minimal info to check topic values
  const posts = await prisma.forum_posts.findMany({
    select: {
      id: true,
      title: true,
      topic: true
    },
    orderBy: {
      topic: 'asc'
    }
  });
  
  console.log(`Retrieved ${posts.length} posts`);
  
  // Show all topic values and counts
  const topicCounts = {};
  posts.forEach(post => {
    const topic = post.topic || 'null';
    if (!topicCounts[topic]) topicCounts[topic] = 0;
    topicCounts[topic]++;
  });
  
  console.log("Topic counts:", topicCounts);
  
  // Show a sample of each topic
  console.log("\nSample posts by topic:");
  Object.keys(topicCounts).forEach(topic => {
    const sample = posts.find(p => (p.topic || 'null') === topic);
    console.log(`Topic "${topic}": "${sample.title}" (${sample.id})`);
  });
  
  // Try a direct query for 'general' posts
  console.log("\nTesting direct query for 'general' posts:");
  const generalPosts = await prisma.forum_posts.findMany({
    where: {
      topic: 'general'
    },
    select: {
      id: true,
      title: true,
      topic: true
    }
  });
  
  console.log(`Found ${generalPosts.length} general posts`);
  
  // Try a direct query for 'daily-challenge' posts
  console.log("\nTesting direct query for 'daily-challenge' posts:");
  const challengePosts = await prisma.forum_posts.findMany({
    where: {
      topic: 'daily-challenge'
    },
    select: {
      id: true,
      title: true,
      topic: true
    }
  });
  
  console.log(`Found ${challengePosts.length} daily-challenge posts`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
