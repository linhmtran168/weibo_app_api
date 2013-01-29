/*
 * Helpers for admin
 */
var Admin = require('../../models/admin')
  , _ = require('lodash')
  ,  i18n = require('i18n');

/*
 * Check user authenticated or not
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
};

/*
 * Check user authenticated or not
 */
exports.ensureNotAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  next();
};

/*
 * Middle ware to create a csrf token to use with the request
 */
exports.csrf = function(req, res, next) {
  // Set the local token variale
  res.locals.token = req.session._csrf;

  next();
};

/*
 * Middleware to validate an admin
 */
exports.validateAdmin = function(req, res, next) {
  // Check fields
  req.check('username', i18n.__('invalid-username')).notEmpty().is(/^[a-zA-Z0-9]+$/);
  req.check('username', i18n.__('invalid-username-length')).len(4, 20);
  req.check('email', i18n.__('invalid-email')).notEmpty().isEmail();
  req.check('password', i18n.__('invalid-password')).notEmpty().len(6, 20);
  req.check('passwordConfirm', i18n.__('invalid-pasword-confirm')).notEmpty().equals(req.body.password);

  // Create the maped errors array
  var errors = req.validationErrors(true);


  // Check for exist email or username
  Admin.findOne({ $or: [ { 'username': req.body.username }, { 'email': req.body.email } ] }, function(err, user) {
    if (err) {
      console.error(err);
      return res.redirect(500, 'back');
    }

    // If exist user add error to the errors array
    if (user) {
      if (user.username === req.body.username) {
        if (!errors.username) {
          errors.username = {
            msg: i18n.__('same-admin-username-error'),
            param: 'username',
            value: req.body.username
          };
        }
      } else {
        if (!errors.email) {
          errors.email = {
            msg: i18n.__('same-admin-email-error'),
            param: 'email',
            value: req.body.email
          };
        }
      }
    }

    // Create the message array
    var msgArray = [];

    if (!_.isEmpty(errors)) {
      msgArray = _.map(errors, function(error) {
        return error.msg;
      });
    }

    if (!_.isEmpty(msgArray)) {
      req.session.message =  { type: 'error', messages: msgArray };
      return res.redirect('back');
    }


    return next();
  });

};
