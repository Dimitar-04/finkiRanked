const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { supabase } = require("../supabaseClient");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login?error=google_auth_failed",
  }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect("http://localhost:5173/login?error=user_not_found");
    }

    try {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: req.user.email,
        options: {
          redirectTo: "http://localhost:5173/dashboard",
        },
      });

      if (error) {
        throw error;
      }

      res.redirect(data.properties.action_link);
    } catch (error) {
      console.error("Error generating Supabase magic link:", error);
      return res.redirect(
        "http://localhost:5173/login?error=session_generation_failed"
      );
    }
  }
);

module.exports = router;
