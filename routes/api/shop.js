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
      // Create the key value array from the shop object
      var items = _.map(Object.keys(shopJSON), function(key) {
        if (!_.contains(['description', 'customFields', '_id', 'avatar', 'name'], key)) {
          return { key: i18n.__(key), value: shopJSON[key] };
        }
      });

      // If there are custom fields add them to the array
      if (!_.isEmpty(shopJSON.customFields)) {
        console.log(shopJSON.customFields);
        _.each(shopJSON.customFields, function(fieldValue) {
          items.push({ key: fieldValue.name, value: fieldValue.value });
        });
      }

      return res.json({
        status: 1,
        shop: {
          _id: shop.id,
          name: shop.name,
          description: shop.description,
          avatar: shop.avatar,
          items: items,
        },
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
