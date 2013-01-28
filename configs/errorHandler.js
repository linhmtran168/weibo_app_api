/*
 * Error handlers for the app
 */
module.exports = {

  // Log Error
  logErrors: function(err, req, res, next) {
    console.error(err.stack);
    next(err);
  },

  // Handling client error
  clientErrorHandler: function(err, req, res, next) {
    if (req.xhr) {
      res.send(500, { error: 'Something really big blew up!' });
    } else {
      next(err);
    }
  }, 

  // Handling all errors
  errorHandler: function(err, req, res, next) {
    res.status(500);
    res.render('error', { 'error': err });
  }
};
