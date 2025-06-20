const User = require("./User");

class Student extends User {
  constructor(data = {}) {
    super(data);

    this.solved_problems = data.solved_problems || 0;
    this.rank = data.rank || "Novice";
    this.points = data.points || 0;

    this.postCounter = data.postCounter || 3;
    this.postCheckCounter = data.postCheckCounter || 0;
  }
}

module.exports = Student;
