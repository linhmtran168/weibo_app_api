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
  console.log(req.user);
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
 * Middleware to validate an admin
 */
exports.validateAdmin = function(req, res, next) {
  // Check fields
  req.check('username', i18n.__('invalid-username')).notEmpty().is(/^[a-zA-Z0-9]+$/);
  req.check('username', i18n.__('invalid-username-length')).len(4, 20);
  // If exist email field
  if (req.body.email) {
    req.check('email', i18n.__('invalid-email')).isEmail();
  }
  req.check('password', i18n.__('invalid-password')).notEmpty().len(6, 20);
  req.check('passwordConfirm', i18n.__('invalid-pasword-confirm')).notEmpty().equals(req.body.password);

  // Create the maped errors array
  var errors = req.validationErrors(true);

  if (!errors) {
    errors = {};
  }

  // Check for exist email or username
  Admin.findOne({ $or: [ { 'username': req.body.username }, { 'email': req.body.email } ], role: 'superAdmin' }, function(err, user) {
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
      req.flash('message', { type: 'error', messages: msgArray });
      return res.redirect('back');
    }


    return next();
  });

};

/*
 * Middleware to check if a user is a super admin or not
 */
exports.isSuperAdmin = function(req, res, next) {
  // If this user is not super admin, redirect to main shop detail page
  if (req.user.role !== 'superAdmin') {
    return res.redirect('/shop');
  }

  next();
};

/*
 * Middleware to check if a user is shop admin or not
 */
exports.isShopAdmin = function(req, res, next) {
  // If this user is not super admin, redirect to main shop detail page
  if (req.user.role !== 'shopAdmin') {
    return res.redirect('/');
  }

  next();
};
