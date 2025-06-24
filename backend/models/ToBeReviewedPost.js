class ToBeReviewedPost {
  constructor({
    title,
    content,
    authorId,
    authorName,
    id,
    commentCount,
    dateCreated,
  }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.created_at = dateCreated.toISOString() || new Date().toISOString();
    this.comment_count = commentCount;
    this.author_id = authorId;
    this.author_name = authorName;
  }
}

module.exports = ToBeReviewedPost;
