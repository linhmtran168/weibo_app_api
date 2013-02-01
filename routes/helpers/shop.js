/*
 * Helpers for shop related function
 */
var Admin = require('../../models/admin')
  , Shop = require('../../models/shop')
  , _ = require('lodash')
  , bcrypt = require('bcrypt')
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

/*
 * Function to validate shop when super admin edit it
 */
exports.validateEditShopSuper = function(req, res, next) {
  // Validate field
  req.check('shopName', i18n.__('shop-name-required')).notEmpty();
  if (req.body.password) {
    req.check('password', i18n.__('invalid-password')).len(6, 20);
    req.check('passwordConfirm', i18n.__('invalid-pasword-confirm')).equals(req.body.password);
  }


  // Create the maped errors array
  var errors = req.validationErrors(true);
  var msgArray = [];

  if (!_.isEmpty(errors)) {
    msgArray = _.map(errors, function(error) {
      return error.msg;
    });
  }

  if (!_.isEmpty(msgArray)) {
    req.flash('message', { type: 'error' , messages: msgArray });
    return res.redirect('back');
  }

  return next();
};

/*
 * Function to validate shop when shop admin edit it
 */
exports.validateEditShop = function(req, res, next) {
  // Validate field
  req.check('shopName', i18n.__('shop-name-required')).notEmpty();
  if (req.body.phoneNumber) {
    req.check('phoneNumber', i18n.__('invalid-phone-num')).regex(/^[0-9]+$/i);
  }
  if (req.body.openingHours) {
    req.check('openingHours', i18n.__('wrong-time-format')).regex(/^([01][0-9]|2[0-3]):[0-5][0-9] - ([01][0-9]|2[0-3]):[0-5][0-9]$/i);
  }

  // Create the maped errors array
  var errors = req.validationErrors(true);
  var msgArray = [];

  if (!_.isEmpty(errors)) {
    msgArray = _.map(errors, function(error) {
      return error.msg;
    });
  }

  if (!req.body.payOptions) {
    msgArray.push(i18n.__('need-one-pay-opt'));
  }

  if (!req.body.languages) {
    msgArray.push(i18n.__('need-one-lang'));
  }

  // Check the custom field
  _(req.body.customFields).forEach(function(field) {
    // If there is only value or field name return error
    if (typeof field === 'string' && field.length > 0) {
      msgArray.push(i18n.__('custom-field-error'));
      return false;
    } 

    if (_.isArray(field) && _.isEmpty(field[1])) {
      msgArray.push(i18n.__('custom-field-error'));
      return false;
    }
  });

  if (!_.isEmpty(msgArray)) {
    req.flash('message', { type: 'error', messages: msgArray });
    return res.redirect('back');
  }

  return next();
};


// Helper function to save shop & shop admin
exports.saveShopAndAdmin = function(req, res, avatar) {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    if (err) {
      console.error(err);
      return res.redirect(500, 'back');
    }

    // Create new shop instance
    var shop = new Shop({
      name: req.body.shopName,
    });

    if (req.body.description) {
      shop.description = req.body.description;
    }
    if (avatar) {
      shop.avatar = avatar;
    }

    // console.log(req.body.username + ' - ' + hash);
    // Create new shop admin instance
    var shopAdmin = new Admin({
      username: req.body.username,
      hash: hash,
      role: 'shopAdmin'
    });

    // Attemp to save the shop admin
    shopAdmin.save(function(err) {
      if (err) {
        console.error(err);
        return res.redirect(500, 'back');
      }

      // Add the admin's id to the shop
      shop.admin = shopAdmin.id;

      console.log(shop);
      // Attempt to save the shop
      shop.save(function(err) {
        if (err) {
          console.error(err);
          return res.redirect(500, 'back');
        }

        console.log('Save shop & shop admin successfully');
        
        req.flash('message', { type: 'success', messages: [i18n.__('create-shop-success')] });
        return res.redirect('/');
      });
    });
  });
};

// Helper function to edit shop & admin
exports.editShopAndAdmin = function(shop, req, res, avatar) {

  if (avatar) {
    // Delete old image
    shopHelpers.deleteImage(shop.avatar);
    shop.avatar = avatar;
  }

  Admin.findById(shop.admin, function(err, shopAdmin) {
    if (err) {
      console.error(err);
      return res.redirect(500, 'back');
    }

    // Hash the new password
    bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
        console.error(err);
        return res.redirect(500, 'back');
      }

      shopAdmin.hash = hash;

      // Attempt to save the shop admin
      shopAdmin.save(function(err) {
        if (err) {
          console.error(err);
          return res.redirect(500, 'back');
        }

        // Attemp to save the sop
        shop.save(function(err) {
          // Create the successful message and redirect
          req.flash('message', { type: 'success', messages: [ i18n.__('update-shop-success') ] });
          return res.redirect('/shop/info/' + shop.id);
        });
      });
    });
  });
};
