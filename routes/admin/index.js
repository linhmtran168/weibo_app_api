/*
 * Routes for admin part of the server
 */
var passport = require('passport')
  , i18n = require('i18n')
  , adminHelpers = require('../helpers/admin')
  , requestHelpers = require('../helpers/request')
  , shopHelpers = require('../helpers/shop')
  , imageCtrl = require('./image')
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
    successRedirect: '/',
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
  app.get('/admin/shops', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin, requestHelpers.checkPageParam], shopCtrl.index);

  // Create shop
  app.get('/admin/shop/create', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin, requestHelpers.csrf], shopCtrl.create);
  app.post('/admin/shop/create', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin, shopHelpers.checkShopName, shopHelpers.validateShopAdmin], shopCtrl.create);

  // Get a shop
  app.get('/admin/shop/info/:id', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin], shopCtrl.info);

  // Edit shop
  app.get('/admin/shop/edit/:id', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin, requestHelpers.csrf], shopCtrl.editSuper);
  app.post('/admin/shop/edit/:id', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin, shopHelpers.validateEditShopSuper], shopCtrl.editSuper);

  // Delete a shop
  app.get('/admin/shop/delete/:id', [adminHelpers.ensureAuthenticated, adminHelpers.isSuperAdmin], shopCtrl.delete);

  /*
   * =========== Route for shop admin
   */
  // Check user name])
  app.get('/admin/check-username', adminHelpers.ensureAuthenticated, adminCtrl.checkUsername);

  // Get admin's shop
  app.get('/shop', [adminHelpers.ensureAuthenticated, adminHelpers.isShopAdmin], shopCtrl.detail);

  // Render admin' edit shop page
  app.get('/shop/edit', [adminHelpers.ensureAuthenticated, adminHelpers.isShopAdmin, requestHelpers.csrf], shopCtrl.editShop);
  // Edit the shop
  app.post('/shop/edit', [adminHelpers.ensureAuthenticated, adminHelpers.isShopAdmin, shopHelpers.validateEditShop], shopCtrl.editShop);
  
  // Update weibo account
  app.post('/shop/update-weibo-account', [adminHelpers.ensureAuthenticated, adminHelpers.isShopAdmin], shopCtrl.updateWeiboAccount);
  // Remove weibo account
  app.post('/shop/remove-weibo-account', [adminHelpers.ensureAuthenticated, adminHelpers.isShopAdmin], shopCtrl.removeWeiboAccount);

  // Render images page
  app.get('/shop/images', [adminHelpers.ensureAuthenticated, adminHelpers.isShopAdmin, requestHelpers.csrf], imageCtrl.images);
  // Upload image
  app.post('/shop/upload-image', [adminHelpers.ensureAuthenticated, adminHelpers.isShopAdmin, requestHelpers.csrf], imageCtrl.uploadShopImage);
  // Edit image description
  app.post('/shop/image/update-description/:id', [adminHelpers.ensureAuthenticated, adminHelpers.isShopAdmin], imageCtrl.updateDescription);
  // Delete image
  app.get('/shop/image/delete/:id', [adminHelpers.ensureAuthenticated, adminHelpers.isShopAdmin], imageCtrl.delete);
};
