class ForumPost {
  constructor({ title, content, authorId, authorName, id, commentCount }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.date_created = new Date().toISOString(); // Set current date as default
    this.comment_count = commentCount;
    this.author_id = authorId;
    this.author_name = authorName;
  }
}

module.exports = ForumPost;
