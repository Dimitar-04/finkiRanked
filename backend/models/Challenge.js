class Challenge {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title || "";
    this.content = data.content || "";
    this.solving_date = data.solving_date;
    this.attempted_by = data.attempted_by;
    this.solved_by = data.solved_by;
    this.expired = data.expired || false;
    this.examples = data.examples;
    this.test_cases = data.test_cases;
    this.output_type = data.output_type;
    this.difficulty = data.difficulty;
  }
  validate() {
    const errors = [];

    if (!this.title || this.title.trim() === "") {
      errors.push("Challenge title is required");
    }

    if (!this.content || this.content.trim() === "") {
      errors.push("Challenge description/content is required");
    }

    if (!this.solving_date) {
      errors.push("Challenge solving date is required");
    } else if (
      !(this.solving_date instanceof Date) &&
      isNaN(new Date(this.solving_date).getTime())
    ) {
      errors.push("Challenge solving date must be a valid date");
    }

    if (!this.examples || !Array.isArray(this.examples)) {
      errors.push("Examples must be an array");
    } else if (this.examples.length < 2) {
      errors.push("At least 2 examples are required");
    } else {
      this.examples.forEach((example, index) => {
        if (!example.input || !example.output) {
          errors.push(`Example ${index + 1} must have both input and output`);
        }
      });
    }

    // if (!this.test_cases || !Array.isArray(this.test_cases)) {
    //   errors.push("Test cases must be an array");
    // // } else if (this.test_cases.length < 10) {
    // //   errors.push("At least 10 test cases are required");
    // // } else {
    //   this.test_cases.forEach((testCase, index) => {
    //     if (!testCase.input || !testCase.output) {
    //       errors.push(`Test case ${index + 1} must have both input and output`);
    //     }
    //   });
    // }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Challenge;
