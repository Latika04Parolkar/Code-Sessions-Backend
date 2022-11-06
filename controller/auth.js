const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const GOOGLE_CLIENT_ID = '308376505977-rkianeftb388ss9tfk66j993d47ombpp.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
  }
));

// passport.serializeUser(function(user, done) {
//     done(null, user);
// })

// passport.deserializeUser(function(user, done) {
//     done(null, user);
// })