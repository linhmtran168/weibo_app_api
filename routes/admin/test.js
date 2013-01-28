var Admin = require('../../models/admin')
  , i18n = require('i18n');

/*
 * Route for creating data for test
 */
module.exports = {
  // Test Create admin
  createAdmin: function(req, res) {
    if (req.method !== 'POST') {
      return res.render('test/createAdmin', {
        title: i18n.__('create-admin')
      });
    }

    // Post request
    var admin = new Admin({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: 'superAdmin'
    });

    // Attem to save the admin
    admin.save(function(err) {
      if (err) {
        console.error(error);
        res.redirect(500, '/test/creat-admin');
      } else {
        console.log('Save admin successfully');
      }
    });
  }
};
