var Shop = require('../../models/shop')
  , Admin = require('../../models/admin')
  , _ = require('lodash')
  , bcrypt = require('bcrypt')
  , shopHelpers = require('../helpers/shop')
  , i18n = require('i18n');

// Helper function to save shop & shop admin
function saveShopAndAdmin(req, res, avatar) {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    if (err) {
      console.error(err);
      return res.redirect(500, 'back');
    }

    // Create new shop instance
    var shop = new Shop({
      name: req.body.shopName,
    });

    if (req.body.description) {
      shop.description = req.body.description;
    }
    if (avatar) {
      shop.avatar = avatar;
    }

    // console.log(req.body.username + ' - ' + hash);
    // Create new shop admin instance
    var shopAdmin = new Admin({
      username: req.body.username,
      hash: hash,
      role: 'shopAdmin'
    });

    // Attemp to save the shop admin
    shopAdmin.save(function(err) {
      if (err) {
        console.error(err);
        return res.redirect(500, 'back');
      }

      // Add the admin's id to the shop
      shop.admin = shopAdmin.id;

      console.log(shop);
      // Attempt to save the shop
      shop.save(function(err) {
        if (err) {
          console.error(err);
          return res.redirect(500, 'back');
        }

        console.log('Save shop & shop admin successfully');
        
        req.flash('message', { type: 'success', messages: [i18n.__('create-shop-success')] });
        return res.redirect('/shops');
      });
    });
  });
}

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
      saveShopAndAdmin(req, res, null);
    } else {
      console.log('Shop ---- upload image for shop');
      shopHelpers.uploadImage(req.files.avatar, function(err, newAvatarName) {
        if (err) {
          if (err.type === 'system') {
            return res.redirect(500, 'back');
          }

          req.flash('message', { type: 'error', messages: [err.message] });
          return res.redirect('back');
        }

        // Save shop & shop admin
        saveShopAndAdmin(req, res, newAvatarName);
      });
    }
  },

  edit: function(req, res) {

  },

  delete: function(req, res) {

  }
};
