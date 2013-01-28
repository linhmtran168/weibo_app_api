/*
 * Routes for admin part of the server
 */
var passport = require('passport')
  , authenHelpers = require('../helpers/authenticate');

module.exports = function(app) {
  /*
   * ============ Route for test
   */
  app.get('/test/create-admin', authenHelpers.csrf, testCtrl.createAdmin);
  app.post('/test/create-admin', testCtrl.createAdmin);
};
