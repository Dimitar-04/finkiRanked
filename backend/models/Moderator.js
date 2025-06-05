const User = require('./User');

class Moderator extends User {
  constructor(data = {}) {
    super(data);
    this.isModerator = true;
  }
}

module.exports = Moderator;
