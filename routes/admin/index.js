/*
 * Routes for admin part of the server
 */
var passport = require('passport')
  , adminHelper = require('../helpers/admin')
  , testCtrl = require('./test');

module.exports = function(app) {
  /*
   * ============ Route for test
   */
  app.get('/test/create-admin', adminHelper.csrf, testCtrl.createAdmin);
  app.post('/test/create-admin', adminHelper.validateAdmin, testCtrl.createAdmin);
};
