/*
 * Routes for admin part of the server
 */
var passport = require('passport')
  , i18n = require('i18n')
  , adminHelpers = require('../helpers/admin')
  , requestHelpers = require('../helpers/request')
  , shopHelpers = require('../helpers/shop')
  , testCtrl = require('./test')
  , adminCtrl = require('./admin')
  , shopCtrl = require('./shop');

module.exports = function(app) {
  /*
   * ============ Route for test
   */
  app.get('/test/create-admin', requestHelpers.csrf, testCtrl.createAdmin);
  app.post('/test/create-admin', adminHelpers.validateAdmin, testCtrl.createAdmin);

  /*
   * ============ Route for super admin
   */
  // Login Route
  app.get('/login', [adminHelpers.ensureNotAuthenticated, requestHelpers.csrf], adminCtrl.login);
  app.post('/login', [adminHelpers.ensureNotAuthenticated, passport.authenticate('local', {
    badRequestMessage: i18n.__('missing-credentials'),
    successRedirect: '/test/create-admin',
    failureRedirect: '/login',
    failureFlash: true,
  })]);

  // Logout route
  app.get('/logout', [adminHelpers.ensureAuthenticated], adminCtrl.logout);

  /*
   * =========== Route for shop
   */
  // List shop
  app.get('/', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin, requestHelpers.checkPageParam], shopCtrl.index);
  app.get('/shops', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin, requestHelpers.checkPageParam], shopCtrl.index);

  // Create shop
  app.get('/shop/create', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin, requestHelpers.csrf], shopCtrl.create);
  app.post('/shop/create', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin, shopHelpers.checkShopName, shopHelpers.validateShopAdmin], shopCtrl.create);

  /*
   * =========== Route for shop admin
   */
  app.get('/admin/check-username', adminHelpers.ensureAuthenticated, adminCtrl.checkUsername);
};
