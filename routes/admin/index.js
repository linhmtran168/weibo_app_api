/*
 * Routes for admin part of the server
 */
var passport = require('passport')
  , i18n = require('i18n')
  , adminHelper = require('../helpers/admin')
  , testCtrl = require('./test')
  , adminCtrl = require('./admin');

module.exports = function(app) {
  /*
   * ============ Route for test
   */
  app.get('/test/create-admin', adminHelper.csrf, testCtrl.createAdmin);
  app.post('/test/create-admin', adminHelper.validateAdmin, testCtrl.createAdmin);

  /*
   * ============ Route for super admin
   */
  // Login Route
  app.get('/login', [adminHelper.ensureNotAuthenticated, adminHelper.csrf], adminCtrl.login);
  app.post('/login', [adminHelper.ensureNotAuthenticated, passport.authenticate('local', {
    badRequestMessage: i18n.__('missing-credentials'),
    successRedirect: '/test/create-admin',
    failureRedirect: '/login',
    failureFlash: true,
  })]);

  // Logout route
  app.get('/logout', [adminHelper.ensureAuthenticated], adminCtrl.logout);
};
