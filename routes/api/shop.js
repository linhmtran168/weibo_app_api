/*
 * API for shop
 */
var Shop = require('../../models/shop')
  , i18n = require('i18n')
  , mongoose = require('mongoose')
  , _ = require('lodash');

module.exports = {
  /*
   * Get info of one shop
   */
  info: function(req, res) {
    Shop.findById(req.params.id, '-createdAt -updatedAt -admin -__v', function(err, shop) {
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
      var items = [];
      _.each(Object.keys(shopJSON), function(key) {
        if (!_.contains(['description', 'customFields', '_id', 'avatar', 'name', 'location', 'images', 'weiboAccount'], key)) {
          var value;
          if (key === 'isWifi') {
            if (shopJSON[key]) {
              value = i18n.__('Yes');
            } else {
              value = i18n.__('No');
            }
          } else if (key === 'category') {
            value = i18n.__(shopJSON.category.name);
          } else {
            value = shopJSON[key];
          }


          items.push({ key: i18n.__(key), value: value });
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
          images: shop.images,
          location: shop.location,
          weiboAccount: shop.weiboAccount,
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
      , conn = mongoose.connection
      , query = {}
      , earthRadius = 6378;

    var userLngLat = [parseFloat(req.query.long), parseFloat(req.query.lat)];

    if (req.query.catMain) {
      query = { 'category.main': req.query.catMain };
    }

    if (req.query.catSub) {
      query = { 'category.sub': req.query.catSub };
    }

    conn.db.executeDbCommand({
      geoNear: 'shops',
      near: userLngLat,
      spherical: true,
      maxDistance: radius / earthRadius,
      distanceMultiplier: 6378,
      query: query
    }, function (err, result) {

      if (err) {
        console.error(err);
        return res.json({
          status: 0,
          errors: [i18n.__('system-error')]
        });
      }

      var shops = result.documents[0].results;
      return res.json({
        status: 1,
        shops: shops,
        messages: i18n.__('get-shop-success')
      });
    });

  },
};
