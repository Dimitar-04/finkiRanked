const User = require('./User');

class Student extends User {
  constructor(data = {}) {
    super(data);
    this.solvedProblems = data.solvedProblems || 0;
    this.rank = data.rank || 'Novice';
    this.points = data.points || 0;
    this.commentCounter = data.commentCounter || 3;
    this.commentCheckCounter = data.commentCheckCounter || 0;
    this.postCounter = data.postCounter || 3;
    this.postCheckCounter = data.postCheckCounter || 0;
    this.isModerator = false;
  }
}

module.exports = Student;
