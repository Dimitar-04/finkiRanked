const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Student = require("../models/Student");
const prisma = require("../lib/prisma");

const { supabase } = require("../supabaseClient");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error("No email found in Google profile"), null);
        }

        let user = await prisma.users.findUnique({
          where: { email: email },
        });

        if (!user) {
          const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
              email: email,
              user_metadata: {
                name: profile.displayName,
                avatar_url: profile.photos[0].value,
              },

              email_confirm: true,
            });

          if (authError) {
            console.error("Supabase Auth user creation error:", authError);
            return done(authError, null);
          }
          console.log(profile);
          const studentForDb = new Student({
            id: authData.user.id,
            username: profile.displayName,
            email: email,
            name: profile.displayName,
          });

          user = await prisma.users.create({
            data: studentForDb,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error, null);
      }
    }
  )
);
