class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username;
    this.name = data.name;
    this.isModerator = data.isModerator || false;
    this.email = data.email;
    this.attempts = data.attempts || 0;
    this.solvedDailyChallenge = data.solvedDailyChallenge || false;

    this.daily_points = data.daily_points || 0;
    this.daily_test_case_id = data.daily_test_case_id || null;
  }

  validate(password, confirmPassword) {
    const errors = {};

    if (!this.username) {
      errors.username = 'Username is required';
    }
    if (!this.name) {
      errors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const multipleAtOrDotComRegex = /@.*@|(\.com).*\.com/;

    if (!this.email) {
      errors.email = 'Email is required';
    } else if (!this.email.endsWith('@students.finki.ukim.mk')) {
      errors.email = 'Email must be a valid FINKI student email';
    } else if (!emailRegex.test(this.email)) {
      errors.email = 'Email format is invalid';
    } else if (multipleAtOrDotComRegex.test(this.email)) {
      errors.email = "Email cannot contain multiple '@' or '.com'";
    }

    // Password validations
    if (!password) {
      errors.password = 'Password is required';
    } else {
      if (
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password)
      ) {
        errors.passwordLength =
          'Password must be at least 8 characters long, contain one uppercase letter and one number';
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password && password !== confirmPassword) {
      errors.passwordMatch = 'Passwords do not match';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}

module.exports = User;
