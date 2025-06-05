class ForumPost {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.authorName = data.authorName;
    this.dateCreated = new Date();
    this.comments = [];
  }
}

module.exports = ForumPost;
