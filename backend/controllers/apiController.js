const supabase = require('../supabaseClient');
const User = require('../models/User');

async function createUserInSupabase(userInstance) {
  const { data, error } = await supabase.from('users').insert([
    {
      id: userInstance.id,
      username: userInstance.username,
      email: userInstance.email,
      name: userInstance.name,
      solved_problems: 0,
      rank: 'Novice',
      points: 0,
      commentCounter: 3,
      commentCheckCounter: 0,
      postCounter: 3,
      postCheckCounter: 0,
    },
  ]);
  return { data, error };
}

const registerPOST = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    const userModel = new User({ username, email, name });

    const validationErrors = userModel.validate();

    if (validationErrors) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
        success: false,
      });
    }

    if (!password) {
      return res.status(400).json({
        message: 'Password is required',
        success: false,
      });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true,
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

    userModel.id = data.user.id;

    const { error: dbError } = await createUserInSupabase(userModel);
    if (dbError) {
      console.error('Database insert error:', dbError);
      return res.status(500).json({
        message: 'Failed to save user in database',
        success: false,
      });
    }

    res.status(200).json({
      message: 'Registration successful',
      success: true,
      user: userModel.toJSON(),
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
