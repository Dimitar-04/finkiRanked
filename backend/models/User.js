class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.name = data.name;
    this.isModerator = false;
    this.email = data.email || '';
  }

  validate() {
    const errors = {};

    if (!this.username) errors.username = 'Username is required';
    if (!this.email) errors.email = 'Email is required';
    if (this.email && !this.email.endsWith('@students.finki.ukim.mk')) {
      errors.email = 'Email must be a valid FINKI student email';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt,
    };
  }
}

module.exports = User;
