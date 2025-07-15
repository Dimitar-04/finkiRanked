class ForumPost {
  constructor({
    title,
    content,
    authorId,
    authorName,
    id,
    commentCount,
    dateCreated,
    topic,
    challengeId,
  }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.date_created = dateCreated.toISOString() || new Date().toISOString();
    this.comment_count = commentCount;
    this.author_id = authorId;
    this.author_name = authorName;
    this.topic = topic;
    this.challenge_id = challengeId;
  }
}

module.exports = ForumPost;
