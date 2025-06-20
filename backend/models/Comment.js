class Comment {
  constructor(data = {}) {
    this.id = data.id;
    this.content = data.content;
    this.author_name = data.authorName;
    this.dateCreated = new Date();
    this.author_id = data.authorId;
    this.post_id = data.postId;
  }
}

module.exports = Comment;
