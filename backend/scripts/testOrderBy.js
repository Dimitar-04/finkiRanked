const prisma = require("../lib/prisma");

async function testOrderBy() {
  console.log("Testing orderBy as an array with multiple criteria");
  
  try {
    // Test using orderBy as an array
    const postsArrayOrder = await prisma.forum_posts.findMany({
      orderBy: [
        { comment_count: 'desc' },
        { date_created: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        comment_count: true,
        date_created: true
      }
    });
    
    console.log("Posts ordered by comment_count DESC, date_created DESC:");
    postsArrayOrder.forEach(post => {
      console.log(`- ${post.title}: ${post.comment_count} comments, ${post.date_created}`);
    });
    
    // Test using orderBy as a single object
    const postsObjectOrder = await prisma.forum_posts.findMany({
      orderBy: { comment_count: 'desc' },
      select: {
        id: true,
        title: true,
        comment_count: true,
        date_created: true
      }
    });
    
    console.log("\nPosts ordered by comment_count DESC (object style):");
    postsObjectOrder.forEach(post => {
      console.log(`- ${post.title}: ${post.comment_count} comments, ${post.date_created}`);
    });
    
  } catch (err) {
    console.error("Error testing orderBy:", err);
  }
}

testOrderBy()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
