const prisma = require("../lib/prisma");

async function testFilter() {
  console.log("Testing topic filter for 'general'");
  
  // Test filter by topic = general
  const generalPosts = await prisma.forum_posts.findMany({
    where: { 
      topic: 'general' 
    }
  });
  
  console.log(`Found ${generalPosts.length} general posts`);
  console.log(generalPosts.map(p => ({ id: p.id, title: p.title, topic: p.topic })));
  
  // Test filter by topic = daily-challenge
  console.log("\nTesting topic filter for 'daily-challenge'");
  const challengePosts = await prisma.forum_posts.findMany({
    where: { 
      topic: 'daily-challenge' 
    }
  });
  
  console.log(`Found ${challengePosts.length} daily challenge posts`);
  console.log(challengePosts.map(p => ({ id: p.id, title: p.title, topic: p.topic })));
  
  // Test filter by comment_count in descending order
  console.log("\nTesting comment count sorting (most popular)");
  const popularPosts = await prisma.forum_posts.findMany({
    orderBy: {
      comment_count: 'desc'
    }
  });
  
  console.log("Posts ordered by popularity:");
  console.log(popularPosts.map(p => ({ id: p.id, title: p.title, comment_count: p.comment_count })));
}

testFilter()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
