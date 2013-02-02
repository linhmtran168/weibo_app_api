/*
 * API Routes
 */
var i18n = require('i18n')
  , User = require('../../models/user')
  , shopHelpers = require('../helpers/shop')
  , apiHelpers = require('../helpers/api')
  , userCtrl = require('./user')
  , shopCtrl = require('./shop');

module.exports = function(app) {
  
  /*
   * Route for user to register to the api
   */
  app.post('/api/register', [apiHelpers.checkApiKey, apiHelpers.validateRegister], userCtrl.register);

  /*
   * ============ shop routes
   */
  // Get info of one shop
  app.get('/api/shop/:id', apiHelpers.checkAccessToken, shopCtrl.info);

  // Get shops nearby
  app.get('/api/shops/near-by', [apiHelpers.checkAccessToken, apiHelpers.checkLngLat], shopCtrl.nearbyShops);
};
