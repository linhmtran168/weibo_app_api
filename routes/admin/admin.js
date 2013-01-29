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
  }
};
