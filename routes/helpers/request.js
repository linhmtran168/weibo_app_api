var i18n = require('i18n')
  , _ = require('lodash');
/*
 * Middleware to create a csrf token to use with the request
 */
exports.csrf = function(req, res, next) {
  // Set the local token variale
  res.locals.token = req.session._csrf;

  next();
};

/*
 * Middleware to check page param
 */
exports.checkPageParam = function(req, res, next) {
    // Get the page number in the query
    if (req.query.page) {
      req.check('page', i18n.__('page-format-error')).isInt().min(1);
      // Create the mapped errors array
      var errors = req.validationErrors(true);

      if (!_.isEmpty(errors)) {
        req.flash('message', { type:'error', message: i18n.__('page-format-error') });
        return res.redirect('back');
      }
    }
    
    return next();
};

