var Admin = require('../../models/admin')
  , bcrypt = require('bcrypt')
  , i18n = require('i18n');

/*
 * Route for creating data for test
 */
module.exports = {
  /*
   * Login admin
   */
  login: function(req, res) {
    // GET Request, render the page
    if (req.method !== 'POST') {
      return res.render('admin/login', {
        title: i18n.__('Login'),
        msg: req.flash('error')
      });
    }
  },

  /*
   * Logout admin
   */
  logout: function(req, res) {
    req.logout();
    return res.redirect('/login');
  },

  /*
   * Check username for admin
   */
  checkUsername: function(req, res) {
    // Find he user with the username
    Admin.findOne({ username: req.param('value'), role: 'shopAdmin' }, function(err, user) {
      if (err) {
        console.log(err);
        return res.json({
          value: req.param('value'),
          valid: false,
          message: i18n.__('system-error')
        });
      }

      // If there is a user return error
      if (user) {
        return res.json({
          value: req.param('value'),
          valid: false,
          message: i18n.__('same-admin-username-error')
        });
      }

      // If not return the success message
      return res.json({
        value: req.param('value'),
        valid: true
      });
    });
  }

};
