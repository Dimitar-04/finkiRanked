const sequelize = require('./dbConfig');
const User = require('../models/User');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

module.exports = {
  syncDatabase,
  User,
};
