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
            return res.redirect('/shop/info/' + shop.id);
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
              return res.redirect('/shop/info/' + shop.id);
            });
          } else {
            // Find the shop admin and update
            shopHelpers.editShopAndAdmin(shop, req, res, newAvatarName);
          }
        });
      }
    });
  },

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

      // Delete the admin user of the shop
      Admin.findByIdAndRemove(shop.admin, function(err, admin) {
        if (err) {
          console.error(err);
          return res.redirect(500, 'back');
        }

        console.log('Shop - successfully deleted the shop admin');

        // Create the success message
        req.flash('message', { type: 'success', messages: [ i18n.__('shop-deleted') ] });
        return res.redirect('/shops');
      });
    });
  }
};
