const registerPOST = (req, res) => {
  console.log('Register request received:');
  console.log('Username:', req.body.username);
  console.log('Email:', req.body.email);
  console.log('Password:', req.body.password);

  res.status(200).json({
    message: 'Registration successful',
    success: true,
    user: {
      username: req.body.username,
      email: req.body.email,
    },
  });
};
module.exports = {
  registerPOST,
};
