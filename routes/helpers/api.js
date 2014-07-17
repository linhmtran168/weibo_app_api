/*
 * API helper
 */
var User = require('../../models/user')
  , apiConfig = require('../../configs/api')
  , i18n = require('i18n')
  , _ = require('lodash');

/*
 * Validate when a new user register to the service
 */
exports.validateRegister = function(req, res, next) {
  req.check('weiboId', i18n.__('weibo-id-required')).notEmpty();
  req.check('weiboSecret', i18n.__('weibo-secret-required')).notEmpty();
  
  // Create the mapped errors array
  var errors = req.validationErrors(true);

  var msgArray = [];
  if (!_.isEmpty(errors)) {
    // Get the error messages
    msgArray = _.map(errors, function(error) {
      return error.msg;
    });
  }

  if (!_.isEmpty(errors)) {
    return res.json({
      status: 0,
      errors: msgArray
    });
  }

  return next();
};

/*
 * Check for a apiKey
 */
exports.checkApiKey = function(req, res, next) {
  if (req.body.apiKey !== apiConfig.apiKey) {
    return res.json({
      status: 0,
      errors: [i18n.__('invalid-api-kay')]
    });
  }

  return next();
};

/*
 * Check for AccesToken
 */
exports.checkAccessToken = function(req, res, next) {
  // Check for the existence of accessToken
  if (!req.param('accessToken')) {
    return res.json({
      status: 0,
      errors: [i18n.__('no-access-token')]
    });
  }

  // If there is an accessToken, check if there is a user
  User.findOne({ 'accessToken': req.param('accessToken') }, function(err, user) {
    if (err) {
      console.error(err);
      return res.json({
        status: 0,
        errors: [i18n.__('system-error')]
      });
    }

    if (!user) {
      return res.json({
        status: 0,
        errors: [i18n.__('invalid-access-token')]
      });
    }

    // if the user exists
    req.user = user;
    return next();
  });
};

/*
 * Check for Long lat
 */
exports.checkLngLat = function(req, res, next) {
  req.check('long', i18n.__('invalid-longitude')).notEmpty().isFloat().min(-180).max(180);
  req.check('lat', i18n.__('invalid-latitude')).notEmpty().isFloat().min(-90).max(90);

  var errors = req.validationErrors(true);

  var msgArray = [];
  if (!_.isEmpty(errors)) {
    msgArray = _.map(errors, function(error) {
      return error.msg;
    });
  }

  if (!_.isEmpty(msgArray)) {
    return res.json({
      status: 0,
      errors: msgArray
    });
  }

  return next();
};
