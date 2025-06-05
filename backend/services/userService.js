// const User = require('../models/User');
const sequelize = require('../db/dbConfig');
const createUser = async (userData) => {
  try {
    const User = sequelize.models.User;

    if (!User) {
      throw new Error('User model not found');
    }
    const newUser = await User.create({
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });

    // Return user data without password
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  } catch (error) {
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      throw new Error(`${field} already exists`);
    }
    throw error;
  }
};

module.exports = {
  createUser,
};
