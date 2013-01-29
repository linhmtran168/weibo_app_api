var Admin = require('../../models/admin')
  , bcrypt = require('bcrypt')
  , i18n = require('i18n');

/*
 * Route for creating data for test
 */
module.exports = {
  /*
   * Login user
   */
  login: function(req, res) {
    res.render('admin/login', {
      title: i18n.__('Login'),
      msg: req.session.message
    });
  }
};
