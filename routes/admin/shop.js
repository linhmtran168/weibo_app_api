var Shop = require('../../models/shop')
  , Admin = require('../../models/admin')
  , _ = require('lodash')
  , bcrypt = require('bcrypt')
  , shopHelpers = require('../helpers/shop')
  , imgHelpers = require('../helpers/image')
  , i18n = require('i18n');


/*
 * Route for creating data for test
 */
module.exports = {
  /*
   * Index list all shops
   */
  index: function(req, res) {
    // Variables hold the page number
    var itemsPerPage = 30
      , skipItems = 0
      , pageNum = 1
      , msg = req.flash('message')[0];

    // Get the page query 
    if (req.query.page) {
      pageNum = parseInt(req.query.page, 10);
    }

    // Get the shops count
    Shop.count({}, function(err, shopNums) {
      if (err) {
        console.error(err);
        return res.redirect(500, 'back');
      }

      // Get the max number of pages
      var maxNumPage = Math.ceil(shopNums / itemsPerPage);
      maxNumPage = maxNumPage > 0 ? maxNumPage : 1;

      // If page query > max number of page
      if (pageNum > maxNumPage) {
        pageNum = maxNumPage;
      }

      // Calculate the skip items
      skipItems = (pageNum - 1) * itemsPerPage;

      // Find the shop for this page number
      Shop.find({}, null, { sort: 'name', limit: itemsPerPage, skip: skipItems }, function(err, shops) {
        if (err) {
          console.error(err);
          return res.redirect(500, 'back');
        }

        return res.render('shop/index', {
          title: i18n.__('list-shop'),
          shops: shops,
          msg: msg, 
          pageNum: pageNum,
          maxNumPage: maxNumPage,
        });
      });

    });
  },

  /* 
   * Info for super admin
   */
  info: function(req, res) {
    // GET the shop id from the request
    var shopId = req.params.id;

    Shop.findById(shopId).populate('admin', '-hash').exec(function(err, shop) {
      if (err) {
        if (err.type === 'system') {
          return res.redirect(500, 'back');
        }
      }

      console.log(shop);

      if (!shop) {
        req.flash('message', { type: 'error', messages: [ i18n.__('no-shop-id') ] });
        return res.redirect('back');
      }

      return res.render('shop/info', {
        shop: shop,
        title: shop.name,
        msg: req.flash('message')[0]
      });
    });
  },

  /*
   *
   */
  detail: function(req, res) {
    // Find the shop with the id of the current user
    Shop.findOne({ admin: req.user.id }, function(err, shop) {
      if (err) {
        if (err.type === 'system') {
          return res.redirect(500, 'back');
        }
      }

      // If ther is no shop
      if (!shop) {
        req.flash('message', { type: 'error', messages: [ i18n.__('no-shop-id') ] });
        return res.redirect('back');
      }

      console.log(shop);

      return res.render('shop/info', {
        shop: shop,
        title: i18n.__('your-shop'),
        msg: req.flash('message')[0]
      });
    });
  },

  /*
   * Create shop for super admin
   */
  create: function(req, res) {
    // GET request render the create form
    if (req.method !== 'POST') {
      var msg = req.flash('message')[0];

      return res.render('shop/create', {
        title: i18n.__('create-shop'),
        msg: msg
      });
    }

    // POST request process to create the new shop
    // Check for image file in the request
    if (!req.files.avatar.name) {
      // save shop & shop admin
      shopHelpers.saveShopAndAdmin(req, res, null);
    } else {
      console.log('Shop ---- upload image for shop');
      imgHelpers.uploadImage(req.files.avatar, function(err, newAvatarName) {
        if (err) {
          if (err.type === 'system') {
            return res.redirect(500, 'back');
          }

          req.flash('message', { type: 'error', messages: [err.message] });
          return res.redirect('back');
        }

        // Save shop & shop admin
        shopHelpers.saveShopAndAdmin(req, res, newAvatarName);
      });
    }
  },

  /*
   * Edit the shop that the current user is admin
   */
  editShop: function(req, res) {
    // Get the shop
    Shop.findOne({ admin: req.user.id }, function(err, shop) {
      if (err) {
        console.err(err);
        return res.redirect(500, 'back');
      }

      // If ther is no shop
      if (!shop) {
        req.flash('message', { type: 'error', messages: [ i18n.__('no-shop-id') ] });
        return res.redirect('back');
      }

      // GET request render the edit page
      if (req.method !== 'POST') {
        // Create categories
        var categories = [
          {
            name: i18n.__('グルメ'),
            code: 'a',
            subs: [
              i18n.__('居酒屋'),
              i18n.__('焼き鳥・串料理'),
              i18n.__('焼肉・ホルモン'),
              i18n.__('ラーメン・麺料理'),
              i18n.__('寿司・魚料理'),
              i18n.__('お好み焼き・粉もの'),
              i18n.__('オーガニック・創作料理'),
              i18n.__('日本料理・郷土料理'),
              i18n.__('洋食'),
              i18n.__('中華料理'),
              i18n.__('アジア・エスニック料理'),
              i18n.__('イタリア料理'),
              i18n.__('フランス料理'),
              i18n.__('バー・ビアホール'),
              i18n.__('カフェ・スイーツ'),
              i18n.__('その他'),
            ]
          },
          {
            name: i18n.__('ショッピング'),
            code: 'b',
            subs: [
              i18n.__('百貨店'),
              i18n.__('量販店'),
              i18n.__('お土産'),
              i18n.__('アパレル・ジュエリー・ブランド'),
              i18n.__('食品'),
              i18n.__('スーパー・コンビニエンスストア'),
              i18n.__('雑貨・日用品'),
              i18n.__('薬局・化粧品'),
              i18n.__('ホビー・本'),
              i18n.__('その他'),
            ]
          },
          {
            name: i18n.__('宿泊'),
            code: 'c',
            subs: [
              i18n.__('ホテル'),
              i18n.__('ビジネスホテル'),
              i18n.__('旅館'),
            ]
          },
          {
            name: i18n.__('レジャー'),
            code: 'd',
            subs: [
              i18n.__('ゲームセンター'),
              i18n.__('パチンコ'),
              i18n.__('カラオケ'),
              i18n.__('温浴施設'),
              i18n.__('遊園地'),
              i18n.__('観光地'),
              i18n.__('その他'),
            ]
          },
          {
            name: i18n.__('ビューティー・ヘルス'),
            code: 'e',
            subs: [
              i18n.__('エステサロン'),
              i18n.__('ネイルサロン'),
              i18n.__('焼肉・ホルモン'),
              i18n.__('ヘアサロン'),
              i18n.__('リラクゼーション'),
              i18n.__('美容外科'),
              i18n.__('内科'),
              i18n.__('外科'),
              i18n.__('洋食'),
              i18n.__('総合病院'),
              i18n.__('その他'),
            ]
          },
        ];

        return res.render('shop/editShop', {
          title: i18n.__('edit-your-shop'),
          shop: shop,
          categories: categories,
          msg: req.flash('message')[0]
        });
      }

      // POST request
      shop.name = req.body.shopName;
      // Main category 'a', sub category 'a1', shop name ....
      var category = req.body.category
        , dashIndex = category.indexOf('|');

      shop.category.main = category[0];
      shop.category.sub = category.substring(0, dashIndex);
      shop.category.name = category.substring(dashIndex + 1);

      if (req.body.address) {
        shop.address = req.body.address;
      }

      if (req.body.phoneNumber) {
        shop.phoneNumber = req.body.phoneNumber;
      }

      if (req.body.openingHours) {
        shop.openingHours = req.body.openingHours;
      }

      shop.paymentOpts = _.isArray(req.body.payOptions) ? req.body.payOptions : [req.body.payOptions];

      shop.languages = _.isArray(req.body.languages) ? req.body.languages : [req.body.languages];

      shop.wifi = req.body.wifi === 'yes' ? true : false;

      console.log(req.body.stations);
      if (!_.isEmpty(req.body.stations)) {
        shop.nearStations = _.isArray(req.body.stations) ? _.reject(req.body.stations, function(station) { return station === ''; }) : [req.body.stations];
      } else {
        shop.nearStations = [];
      }

      // Change the custom fields
      var fields = [];
      _(req.body.customFields).forEach(function(field) {
        if (!_.isEmpty(field)) {
          fields.push({ name: field[0], value: field[1] });
        } 
      });

      shop.customFields = fields;

      // Update location
      if (req.body.long && req.body.lat) {
        var lnglat = [parseFloat(req.body.long), parseFloat(req.body.lat)];
        shop.location.coords = lnglat;
        if (req.body.geoAddress) {
          shop.location.geoAddress = req.body.geoAddress;
        }
      }

      // If there is no new avatar
      if (!req.files.avatar.name) {
        shop.save(function(err) {
          if (err) {
            console.error(err);
            return res.redirect(500, 'back');
          }

          console.log(shop);

          req.flash('message', { type: 'success', messages: [ i18n.__('update-shop-success') ] });
          return res.redirect('/shop');
        });
      } else {
        // Have new avatar
        imgHelpers.uploadImage(req.files.avatar, function(err, newAvatarName) {
          if (err) {
            if (err.type === 'system') {
              return res.redirect(500, 'back');
            }

            req.flash('message', { type: 'error', messages: [err.message] });
            return res.redirect('back');
          }

          shop.avatar = newAvatarName;

          shop.save(function(err) {
            if (err) {
              console.error(err);
              return res.redirect(500, 'back');
            }

            console.log(shop);

            req.flash('message', { type: 'success', messages: [ i18n.__('update-shop-success') ] });
            return res.redirect('/shop');
          });
        });
      }
    });
  },

  /*
   * Edit shop super admin
   */
  editSuper: function(req, res) {
    // GET the shopID
    var shopId = req.params.id;

    Shop.findById(shopId, function(err, shop) {
      if (err) {
        console.err(err);
        return res.redirect(500, 'back');
      }

      if (!shop) {
        req.flash('message', { type: 'error', messages: [ i18n.__('no-shop-id') ] });
        return res.redirect('back');
      }

      // GET request, render the edit page
      if (req.method !== 'POST') {
        return res.render('shop/editSuper', {
          title: shop.name + ' ' + i18n.__('Edit'),
          shop: shop,
          msg: req.flash('message')[0]
        });
      }

      // POST request, handle to update the shop
      shop.name = req.body.shopName;
      console.log(req.body.description);
      if (req.body.description) {
        shop.description = req.body.description;
      }

      // If there is no image in the request
      if (!req.files.avatar.name) {
        // If there is no password for shop admin
        if (!req.body.password) {
          shop.save(function(err) {
            if (err) {
              console.error(err);
              return res.redirect(500, 'back');
            }

            // Create the successful message and redirect
            req.flash('message', { type: 'success', messages: [ i18n.__('update-shop-success') ] });
            return res.redirect('/admin/shop/info/' + shop.id);
          });
        } else {
          // If there is password field, find the shop admin and update
          shopHelpers.editShopAndAdmin(shop, req, res, null);
        }
      } else {
        // If there is a file in the request;
        imgHelpers.uploadImage(req.files.avatar, function(err, newAvatarName) {
          if (err) {
            if (err.type === 'system') {
              return res.redirect(500, 'back');
            }
            req.flash('message', { type: 'error', messages: [err.message] });
            return res.redirect('back');
          }

          // If there is no password in the request
          if (!req.body.password) {
            // Delete old image;
            imgHelpers.deleteImage(shop.avatar);

            shop.avatar = newAvatarName;

            shop.save(function(err) {
              if (err) {
                console.error(err);
                return res.redirect(500, 'back');
              }

              // Create the successful message and redirect
              req.flash('message', { type: 'success', messages: [ i18n.__('update-shop-success') ] });
              return res.redirect('/admin/shop/info/' + shop.id);
            });
          } else {
            // Find the shop admin and update
            shopHelpers.editShopAndAdmin(shop, req, res, newAvatarName);
          }
        });
      }
    });
  },

  /*
   * Delete a shop
   */
  delete: function(req, res) {
    // GET the shopID
    var shopId = req.params.id;

    Shop.findByIdAndRemove(shopId, function(err, shop) {
      if (err) {
        console.error(err);
        return res.redirect(500, 'back');
      }

      console.log('Shop - successfully deleted the shop');

      // Delete the shop photo
      imgHelpers.deleteImage(shop.avatar);
      
      // Delete the shop images
      if (shop.images.length > 0) {
        process.nextTick(function() {
          _.each(shop.images, function(image) {  
            imgHelpers.deleteImage(image.name);
            imgHelpers.deleteImage(image.thumbnail, true);
          });
        });
      }

      // Delete the admin user of the shop
      Admin.findByIdAndRemove(shop.admin, function(err, admin) {
        if (err) {
          console.error(err);
          return res.redirect(500, 'back');
        }

        console.log('Shop - successfully deleted the shop admin');

        // Create the success message
        req.flash('message', { type: 'success', messages: [ i18n.__('shop-deleted') ] });
        return res.redirect('/');
      });
    });
  },

  /*
   * Update weibo account
   */
  updateWeiboAccount: function(req, res) {
    // Get the current shop
    Shop.findOne({ admin: req.user.id }, function(err, shop) {

      // If ther is no shop
      if (!shop) {
        return res.json({
          status: 0,
          message: i18n.__('no-shop-id')
        });
      }

      shop.weiboAccount.username = req.body.weiboName;
      shop.weiboAccount.id = req.body.weiboId;

      // Attemp to save the shop

      shop.save(function(err) {
        if (err) {
          console.error(err);
          return res.json({
            status: 0,
            message: i18n.__('system-error')
          });
        }

        return res.json({
          status: 1,
          message: i18n.__('success-update-weibo')
        });
      });
    });
  },

  /*
   * Remove weibo account
   */
  removeWeiboAccount: function(req, res) {
    // Get the current shop
    Shop.findOne({ admin: req.user.id }, function(err, shop) {

      // If ther is no shop
      if (!shop) {
        return res.json({
          status: 0,
          message: i18n.__('no-shop-id')
        });
      }

      shop.weiboAccount.username = '';
      shop.weiboAccount.id = '';

      // Attemp to save the shop

      shop.save(function(err) {
        if (err) {
          console.error(err);
          return res.json({
            status: 0,
            message: i18n.__('system-error')
          });
        }

        return res.json({
          status: 1,
          message: i18n.__('success-remove-weibo')
        });
      });
    });
  }
  
};
