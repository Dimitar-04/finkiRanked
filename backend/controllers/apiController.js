const { supabase, restartSupabaseConnection } = require('../supabaseClient');
const Student = require('../models/Student');
const prisma = require('../lib/prisma');

const registerPOST = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    const existingUser = await prisma.users.findUnique({
      where: { username: username },
      select: { id: true },
    });
    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists',
        success: false,
      });
    }
    if (!username || !email || !password || !name) {
      return res.status(400).json({
        message: 'Username, email, password and name are required',
        success: false,
      });
    }

    try {
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: { username, name },
          email_confirm: true,
        });

      if (authError) throw new Error(authError.message);

      const student = new Student({
        id: authUser.user.id,
        username,
        email,
        name,
      });

      const { studentInstance, error } = await createUserInSupabase(student);

      if (error) throw new Error(error.message);
      console.log('User created in Supabase:', studentInstance);

      res.status(201).json({
        message: 'Registration successful',
        success: true,
        user: studentInstance,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      message: 'An error occurred during registration',
      success: false,
    });
  }
};

async function createUserInSupabase(studentInstance) {
  try {
    const newUser = await prisma.users.create({
      data: {
        id: studentInstance.id,
        username: studentInstance.username,
        email: studentInstance.email,
        name: studentInstance.name,
        solved_problems: studentInstance.solvedProblems || 0,
        rank: studentInstance.rank || 'Novice',
        points: studentInstance.points || 0,
        commentCounter: studentInstance.commentCounter || 3,
        commentCheckCounter: studentInstance.commentCheckCounter || 0,
        postCounter: studentInstance.postCounter || 3,
        postCheckCounter: studentInstance.postCheckCounter || 0,
        isModerator: studentInstance.isModerator || false,
        solvedDailyChallenge: studentInstance.solvedDailyChallenge || false,
      },
    });
    return { studentInstance, error: null };
  } catch (error) {
    // Check for Prisma unique constraint error
    if (error.code === 'P2002') {
      const field = error.meta?.target[0];
      if (field === 'username') {
        throw new Error('Username already in use');
      } else if (field === 'email') {
        throw new Error('Email address already registered');
      }
    }
    throw error; // Re-throw any other errors
  }
}

function convertBigIntToString(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        typeof v === 'bigint' ? v.toString() : convertBigIntToString(v),
      ])
    );
  }
  return obj;
}
const loginPOST = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required', success: false });
    }
    const userData = await prisma.users.findUnique({
      where: { email: email },
    });
    if (!userData) {
      return res
        .status(404)
        .json({ message: 'User not found in database', success: false });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message, success: false });
    }

    try {
      const userData = await prisma.users.findUnique({
        where: { email: email },
      });

      if (!userData) {
        return res
          .status(404)
          .json({ message: 'User not found in database', success: false });
      }

      const safeUserData = convertBigIntToString(userData);

      res.status(200).json({
        message: 'User data retrieved',
        success: true,
        user: safeUserData,
      });
    } catch (error) {
      console.error('Login error:', error);
      res
        .status(500)
        .json({ message: 'An error occurred during login', success: false });
    }
  } catch (error) {
    console.error('Login error:', error);
    res
      .status(500)
      .json({ message: 'An error occurred during login', success: false });
  }
};

module.exports = {
  registerPOST,
  loginPOST,
};
