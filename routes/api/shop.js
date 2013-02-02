/*
 * API for shop
 */
var Shop = require('../../models/shop')
  , i18n = require('i18n')
  , _ = require('lodash');

module.exports = {
  /*
   * Get info of one shop
   */
  info: function(req, res) {
    Shop.findById(req.params.id, '-createdAt -updatedAt -admin', function(err, shop) {
      if (err) {
        console.error('err');
        return res.json({
          status: 0,
          errors: [i18n.__('system-error')]
        });
      }

      if (!shop) {
        return res.json({
          status: 0,
          errors: [i18n.__('no-shop-id')]
        });
      }

      var shopJSON = shop.toJSON();
      var items = _.map(Object.keys(shopJSON), function(key) {
        return { key: key, value: shopJSON[key] };
      });
      // console.log(Object.keys(shop.toJSON()));
      // console.log(shopJSON['languages']);
      // console.log(shopJSON['location']);
      // console.log(shop);
      return res.json({
        status: 1,
        items: items,
        message: i18n.__('shop-info-success')
      });
    });
  },

  /*
   * Find nearby shops
   */
  nearbyShops: function(req, res) {
    var radius = 10
      , earthRadius = 6378;

    var userLngLat = [parseFloat(req.query.long), parseFloat(req.query.lat)];

    Shop.find({ 'location.coords': { $within: { $centerSphere: [userLngLat, radius / earthRadius] }} }, '-admin -createdAt -updatedAt', function(err, shops) {
      if (err) {
        console.error(err);
        return res.json({
          status: 0,
          errors: [i18n.__('system-error')]
        });
      }

      if (_.isEmpty(shops)) {
        return res.json({
          status: 1,
          shops: [],
          message: i18n.__('get-shops-success')
        });
      }

      return res.json({
        status: 1,
        shops: shops,
        messages: i18n.__('get-shop-success')
      });
    });
  },
};
