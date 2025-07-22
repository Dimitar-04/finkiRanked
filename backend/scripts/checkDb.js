const prisma = require("../lib/prisma");

async function main() {
  // Count total posts
  const totalCount = await prisma.forum_posts.count();
  console.log(`Total posts: ${totalCount}`);

  // Check distinct topics
  const topics = await prisma.forum_posts.groupBy({
    by: ['topic'],
    _count: {
      _all: true
    }
  });
  console.log("Topics distribution:", topics);

  // Check distinct dates (just the count by date)
  const dates = await prisma.forum_posts.groupBy({
    by: ['date_created'],
    _count: {
      _all: true
    }
  });
  console.log("Dates count:", dates.length);

  // Check comment counts distribution
  const commentCounts = await prisma.forum_posts.groupBy({
    by: ['comment_count'],
    _count: {
      _all: true
    }
  });
  console.log("Comment counts distribution:", commentCounts);

  // Sample some posts with their topic
  const samplePosts = await prisma.forum_posts.findMany({
    take: 5,
    select: {
      id: true,
      title: true,
      topic: true,
      comment_count: true,
      date_created: true
    }
  });
  console.log("Sample posts:", samplePosts);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
