var LocalStrategy = require('passport-local').Strategy
  , Admin = require('../models/admin');


exports.config = function(passport) {
  // Define authentication strategy
  passport.use(new LocalStrategy({
    usernameField: 'username',
  },
  function(username, password, done) {
    Admin.authenticate(username, password, function(err, admin, message) {
      done(err, admin, message);
    });
  }));

  // Serialize user 
  passport.serializeUser(function(admin, done) {
    done(null, admin.id);
  });

  // Deserialize user 
  passport.deserializeUser(function(id, done) {
    Admin.findById(id, function(err, admin) {
      done(err, admin);
    });
  });
};
