const supabase = require('../supabaseClient');
const Student = require('../models/Student');

async function createUserInSupabase(studentInstance) {
  const { data, error } = await supabase.from('users').insert([
    {
      id: studentInstance.id,
      username: studentInstance.username,
      email: studentInstance.email,
      name: studentInstance.name,
      solved_problems: studentInstance.solvedProblems,
      rank: studentInstance.rank,
      points: studentInstance.points,
      commentCounter: studentInstance.commentCounter,
      commentCheckCounter: studentInstance.commentCheckCounter,
      postCounter: studentInstance.postCounter,
      postCheckCounter: studentInstance.postCheckCounter,
      isModerator: studentInstance.isModerator,
    },
  ]);
  return { studentInstance, error };
}

const registerPOST = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    const studentModel = new Student({ username, email, name });

    const validationErrors = studentModel.validate();

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

    studentModel.id = data.user.id;

    const { error: dbError } = await createUserInSupabase(studentModel);
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
      user: studentModel.toJSON(),
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
