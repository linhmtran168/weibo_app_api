/*
 * Helpers to check user authenticate and crsf token
 */

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
  res.locals.token = req.session._crsf;

  next();
};
