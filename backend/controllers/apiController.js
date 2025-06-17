const { supabase } = require("../supabaseClient");
const Student = require("../models/Student");
const User = require("../models/User");
const prisma = require("../lib/prisma");

const registerPOST = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, name } = req.body;

    const tempUser = new User({ username, email, name });
    let valErrors = tempUser.validate(password, confirmPassword);

    if (valErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: valErrors, // Send back the specific errors
        success: false,
      });
    }

    const existingUser = await prisma.users.findUnique({
      where: { username: username },
      select: { id: true },
    });
    if (existingUser) {
      if (!valErrors) {
        valErrors = {};
      }
      valErrors.username = "Username already in use";
      console.log("Errors after checking existing user:", valErrors);
      return res.status(400).json({
        message: "Validation failed",
        errors: valErrors,
        success: false,
      });
    }
    if (!username || !email || !password || !name) {
      return res.status(400).json({
        message: "Username, email, password and name are required",
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

      if (authError) {
        if (!valErrors) {
          valErrors = {};
        }
        valErrors.email = "Email already in use";
        console.log("Errors after checking existing user:", valErrors);
        return res.status(400).json({
          message: "Validation failed",
          errors: valErrors,
          success: false,
        });
      }

      const studentForDb = new Student({
        id: authUser.user.id,
        username,
        email,
        name,
      });

      const { createdStudent, error } = await createUserInSupabase(
        studentForDb
      );
      if (error && error.field) {
        fieldErrors[error.field] = error.message; // fieldErrors becomes { username: "Username already in use" }
        errorMessage = "Registration failed. Please check the details.";
        res.status(400).json({
          message: errorMessage,
          errors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined, // Sends errors: { username: "..." }
          success: false,
        });
      }

      if (error) throw new Error(error.message);
      console.log("User created in Supabase:", createdStudent);

      res.status(201).json({
        message: "Registration successful",
        success: true,
        user: convertBigIntToString(createdStudent),
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "An error occurred during registration",
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
        points: studentInstance.points || 0,
        rank: studentInstance.rank || "Novice",

        postCounter: studentInstance.postCounter || 3,
        postCheckCounter: studentInstance.postCheckCounter || 0,
        isModerator: studentInstance.isModerator || false,
        attempts: studentInstance.attempts || 0,
        solvedDailyChallenge: studentInstance.solvedDailyChallenge || false,
        daily_points: studentInstance.dailyPoints || 0,
        daily_test_case_id: studentInstance.testCaseId || null,
      },
    });
    return { createdStudent: newUser, error: null };
  } catch (error) {
    if (error.code === "P2002") {
      const field = error.meta?.target[0];
      if (field === "username") {
        const specificError = new Error("Username already exists");
        specificError.field = "username";
        throw specificError;
      } else if (field === "email") {
        throw new Error("Email address already registered");
      }
    }
    throw error;
  }
}

function convertBigIntToString(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        typeof v === "bigint" ? v.toString() : convertBigIntToString(v),
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
        .json({ message: "Email and password are required", success: false });
    }
    const userData = await prisma.users.findUnique({
      where: { email: email },
    });
    if (!userData) {
      return res
        .status(404)
        .json({ message: "User not found in database", success: false });
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
          .json({ message: "User not found in database", success: false });
      }

      const safeUserData = convertBigIntToString(userData);

      res.status(200).json({
        message: "User data retrieved",
        success: true,
        user: safeUserData,
      });
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ message: "An error occurred during login", success: false });
    }
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "An error occurred during login", success: false });
  }
};

module.exports = {
  registerPOST,
  loginPOST,
};
