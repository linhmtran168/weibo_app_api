/*
 * Helpers for shop related function
 */
var Admin = require('../../models/admin')
  , _ = require('lodash')
  , fs = require('fs')
  , crypto = require('crypto')
  , i18n = require('i18n');

/*
 * Check for shop name in the request
 */
exports.checkShopName = function(req, res, next) {
  // If there is no
  if (!req.body.shopName) {
    req.flash('message', { type: 'error', messages: [ i18n.__('shop-name-required') ] });
    return res.redirect('back');
  }

  next();
};

/*
 * Valdiate new shop admin
 */
exports.validateShopAdmin = function(req, res, next) {
  // Check fields
  req.check('username', i18n.__('invalid-username')).notEmpty().is(/^[a-zA-Z0-9]+$/);
  req.check('username', i18n.__('invalid-username-length')).len(4, 20);
  req.check('password', i18n.__('invalid-password')).notEmpty().len(6, 20);
  req.check('passwordConfirm', i18n.__('invalid-pasword-confirm')).notEmpty().equals(req.body.password);

  // Create the maped errors array
  var errors = req.validationErrors(true);

  if (!errors) {
    errors = {};
  }

  // Check for existing username
  Admin.findOne({ username: req.body.username, role: 'shopAdmin' }, function(err, user) {
    if (err) {
      console.error(err);
      return res.redirect(500, 'back');
    }

    // If exist user add error to the errors array
    if (user) {
      if (!errors.username) {
        errors.username = {
          msg: i18n.__('same-admin-username-error'),
          param: 'username',
          value: req.body.username
        };
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

// Upload image for sop
exports.uploadImage = function(file, callback) {
  var tmpPath = file.path
    , oldName = file.name
    , extension, newName, newPath
    , allowed_extensions = ['.gif', '.GIF', '.png', '.jpeg', '.jpg', '.JPG', '.JPEG'];

    // Get the extesion of the file
    extension = oldName.substr(oldName.lastIndexOf('.'));

    // Check extension
    if (!_.contains(allowed_extensions, extension)) {
      var err = {
        type: 'extension', 
        message: i18n.__('wrong-file-type')
      };

      return callback(err, false);
    }

    // Create the new image name by hashing the file path
    newName = crypto.createHash('md5').update(tmpPath).digest('hex') + extension;

    // Create the new path for the image
    newPath = './public/images/' + newName;

    // Try to upload the image
    fs.rename(tmpPath, newPath, function(err) {
      if (err) {
        console.error(err);
        var error = {
          type: 'system',
          message: i18n.__('system-error')
        };

        return callback(error, false);
      }
      

      // Delete the temporary image
      fs.unlink(tmpPath, function(err) {
        if (err) {
          console.error(err);
        }

        console.log('Deleted the temporary image');
        return;
      });

      // Return the new name of the image
      return callback(null, newName);
    });
};
