const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const GOOGLE_CLIENT_ID = '1054259671222-ga7ig2f1614hchemcul61nhp34eo72ku.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://code-sessions-backend.onrender.com/google/callback",
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