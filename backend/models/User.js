class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username;
    this.name = data.name;
    this.isModerator = data.isModerator || false;
    this.email = data.email;
    this.attempts = data.attempts || 0;
    this.dailyPoints = data.dailyPoints || 0;
    this.testCaseId = data.testCaseId || null;
  }

  validate(password, confirmPassword) {
    const errors = {};

    if (!this.username) {
      errors.username = "Username is required";
    }
    if (!this.name) {
      errors.name = "Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const multipleAtOrDotComRegex = /@.*@|(\.com).*\.com/;

    if (!this.email) {
      errors.email = "Email is required";
    } else if (!this.email.endsWith("@students.finki.ukim.mk")) {
      errors.email = "Email must be a valid FINKI student email";
    } else if (!emailRegex.test(this.email)) {
      errors.email = "Email format is invalid";
    } else if (multipleAtOrDotComRegex.test(this.email)) {
      errors.email = "Email cannot contain multiple '@' or '.com'";
    }

    // Password validations
    if (!password) {
      errors.password = "Password is required";
    } else {
      if (password.length < 8) {
        errors.passwordLength = "Password must be at least 8 characters long";
      }
      if (!/[A-Z]/.test(password)) {
        errors.passwordUppercase =
          "Password must contain at least one uppercase letter";
      }
      if (!/[0-9]/.test(password)) {
        errors.passwordNumber = "Password must contain at least one number";
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password && password !== confirmPassword) {
      errors.passwordMatch = "Passwords do not match";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // toJSON() {
  //   return {
  //     id: this.id,
  //     username: this.username,
  //     email: this.email,
  //     isModerator: this.isModerator,

  //   };
  // }
}

module.exports = User;
