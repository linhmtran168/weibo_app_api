var Admin = require('../../models/admin')
  , bcrypt = require('bcrypt')
  , i18n = require('i18n');

/*
 * Route for creating data for test
 */
module.exports = {
  // Test Create admin
  createAdmin: function(req, res) {
    if (req.method !== 'POST') {
      return res.render('test/createAdmin', {
        title: i18n.__('create-admin'),
        msg: req.session.message
      });
    }

    // Post request
    // Hash the password and after that create the new admin
    bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
        console.error(err);
        return res.redirect(500, '/');
      } 

      var admin = new Admin({
        username: req.body.username,
        email: req.body.email,
        hash: hash,
        role: 'superAdmin'
      });

      // Attem to save the admin
      admin.save(function(err) {
        if (err) {
          console.error(err);
          res.redirect(500, '/test/create-admin');
        } else {
          console.log('Save admin successfully');
        }
      });
    });
  }
};
