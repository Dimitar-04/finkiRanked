const userService = require('../services/userService');

const registerPOST = async (req, res) => {
  try {
    console.log('Register request received:');
    console.log('Username:', req.body.username);
    console.log('Email:', req.body.email);
    console.log('Password:', req.body.password);
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({
        message: 'Missing required fields',
        success: false,
      });
    }
    if (!req.body.email.endsWith('@students.finki.ukim.mk')) {
      return res.status(400).json({
        message: 'Email must be a valid FINKI student email',
        success: false,
      });
    }
    const user = await userService.createUser({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    res.status(200).json({
      message: 'Registration successful',
      success: true,
      user: {
        username: req.body.username,
        email: req.body.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        message: error.message,
        success: false,
      });
    }

    res.status(500).json({
      message: 'An error occurred during registration',
      success: false,
    });
  }
};
module.exports = {
  registerPOST,
};
