const supabase = require('../supabaseClient');

const registerPOST = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
        success: false,
      });
    }
    if (!email.endsWith('@students.finki.ukim.mk')) {
      return res.status(400).json({
        message: 'Email must be a valid FINKI student email',
        success: false,
      });
    }
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true
    });
    if (error) {
      if (error.message.includes('already registered')) {
        return res.status(409).json({
          message: 'Email already exists',
          success: false,
        });
      }
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
    // Optionally, store additional user info in a public 'users' table
    await supabase.from('users').insert([
      { id: data.user.id, username, email }
    ]);
    res.status(200).json({
      message: 'Registration successful',
      success: true,
      user: {
        id: data.user.id,
        username,
        email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'An error occurred during registration',
      success: false,
    });
  }
};

const loginPOST = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        success: false,
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        message: error.message,
        success: false,
      });
    }

    res.status(200).json({
      message: 'Login successful',
      success: true,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'An error occurred during login',
      success: false,
    });
  }
};

module.exports = {
  registerPOST,
  loginPOST,
};
