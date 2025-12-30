const express = require('express');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');
const { User } = require('../db.model');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');

dotenv.config();
// Setting up session middleware









router.use(passport.initialize()) // initialize passport for authentication and session handling
router.use(passport.session())  // persistent login sessions with passport and express-session


// server URL

// configuring google strategy for passport authentication with check user
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,  // gettting from google cloud console
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // getting from google cloud console
  callbackURL: process.env.PRO_URL + "/auth/google/callback" // callback URL after authentication
},
  async function (accessToken, refreshToken, profile, done) {
    try {
      let user = await User.findOne({ googleId: profile.id }) // checking if user already exists
      if (!user) {
        user = await User.create({  // creating new user if not exists
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          channelLogo: profile.photos?.[0]?.value,
          channelName: profile.displayName,

        })
      } return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }))












passport.serializeUser(function (user, done) { // serialize user for session storage and retrieval its unique identifier
  done(null, user._id); // in real apps, use user ID from DB
})

passport.deserializeUser(async function (id, done) { // deserialize user from session using unique identifier
  try {
    const user = await User.findById(id)
    if (!user) {
      return done(null, false)

    }
    return done(null, user)

  } catch (err) {
    done(err, null)

  }
})


// Route to initiate Google OAuth2 authentication




router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"] // Permissions requested from Google
  })
);




router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.FRONTEND_PAGE_LINK}`, // Login success
    failureRedirect: "/logfailed"         // Login failed
  })
);


router.get('/logfailed', (req, res) => {
  res.send(`
        <h2 style="font-style:bold;">Login Failed</h2>
        <a style="color:blue; " href=${process.env.FRONTEND_PAGE_LINK}>Try Again</a>
        `)
})




//Accessible only if session exists
router.get("/dashboard", (req, res) => {

  // req.isAuthenticated() checks if session + user exists
  if (!req.isAuthenticated()) {
    return res.redirect('/logfailed'); // Redirect to home page if not authenticated
  }
  const userName = req.user.name;
  const userEmail = req.user.email;
  const channelLogo = req.user.channelLogo

  res.json({ success: true, message: "user authenticated", name: userName, email: userEmail, profileImg: channelLogo })
});




// Logs user out and destroys session
router.get("/logout", (req, res) => {

  // Removes passport user from session
  req.logout(() => {

    // Completely destroy session from server
    req.session.destroy(() => {

      // Remove session cookie from browser
      res.clearCookie("Google-Auth-Session");

      // Redirect to home page
      res.redirect(process.env.FRONTEND_PAGE_LINK);
    });
  });
});


















module.exports = router;