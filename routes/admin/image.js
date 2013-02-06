var Shop = require('../../models/shop')
  , _ = require('lodash')
  , bcrypt = require('bcrypt')
  , shopHelpers = require('../helpers/shop')
  , imgHelpers = require('../helpers/image')
  , i18n = require('i18n');
  
/*
 * module for shop image related functions
 */
module.exports = {
  /*
   * List shop image
   */
  images: function(req, res) {
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

      // console.log(shop);

      return res.render('shop/images', {
        shop: shop,
        title: i18n.__('manage-images'),
        msg: req.flash('message')[0]
      });
    });
  },
  
  /*
   * Upload a new image
   */
  uploadShopImage: function(req, res) {
    // Check if the request have a file
    if (!req.files.shopImage.name) {
      req.flash('message', { type: 'error', messages: [ i18n.__('no-shop-image') ] });
      return res.redirect('back');
    }
    
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
      
      // check the number of image of this shop, if > 18 return error
      if (shop.images.length >= 18) {
        req.flash('message', { type: 'error', messages: [ i18n.__('image-limit-error') ] });
        return res.redirect('back');
      }

      // Attemp to upload the image
      imgHelpers.uploadImageWithThumb(req.files.shopImage, function(err, newName, newNameThumb) {
        // If error
        if (err) {
          if (err.type === 'system') {
            req.flash('mesage', { type: 'error', messages: [ i18n.__('system-error') ] });
            return res.redirect(500, 'back');
          }
          
          req.flash('message', { type: 'error', messages: [ err.message ] });
          return res.redirect('back');
        }
        
        var image = {
          name: newName,
          thumbnail: newNameThumb
        };
        
        if (req.body.description) {
          image.description = req.body.description;
        }
        
        shop.images.push(image);
        
        // Attemp to save the shop
        shop.save(function(err) {
          if (err) {
            req.flash('mesage', { type: 'error', messages: [ i18n.__('system-error') ] });
            return res.redirect(500, 'back');
          }

          // console.log(shop);
          
          req.flash('message', { type: 'success', messages: [ i18n.__('success-upload-image') ] });
          res.redirect('/shop/images');
        });

      });

    });
  },

  /*
   * Update image description
   */
  updateDescription: function(req, res) {
    // Check request
    if (!req.body.name || req.body.name !== 'description') {
      return res.send(400, i18n.__('invalid-request'));
    }
    
    // Find the shop with the id of current user
    Shop.findOne({ admin: req.user.id }, function(err, shop) {
      if (err) {
        return res.json(500, i18n.__('system-error'));
      }
      
      // Get image id
      var imageId = req.params.id;
      var image = shop.images.id(imageId);
      if (!image) {
        return res.send(400, i18n.__('no-image-error'));
      }
      
      image.description = req.body.value;

      // Save the image
      shop.save(function(err) {
        console.error(err);
        if (err) {
          return res.send(500, i18n.__('system-error'));
        }
        
        // Send the successfull message
        return res.send(200, i18n.__('image-description-success'));
      });
    });
  },
  
  /*
   * Delete a image
   */
  delete: function(req, res) {
    // Find the shop of current user
    Shop.findOne({ admin: req.user.id }, function(err, shop) {
      if (err) {
        console.error(err);
        req.flash('message', { type: 'error', messages: [ i18n.__('system-error') ] });
        return res.redirect(500, 'back');
      }
      
      // Get image id
      var imageId = req.params.id;
      var image = shop.images.id(imageId);
      
      if (!image) {
        req.flash('message', { type: 'error', messages: [ i18n.__('no-image-error') ] });
        return res.redirect('back');
      }
      
      // Attemp to delete the images
      imgHelpers.deleteImage(image.name);
      imgHelpers.deleteImage(image.thumbnail, true);
      
      // Remove the image
      image.remove();
      
      // Save the shop
      shop.save(function(err) {
        if (err) {
          console.error(err);
          req.flash('message', { type: 'error', messages: [ i18n.__('system-error') ] });
          return res.redirect(500, 'back');
        }

        req.flash('message', { type: 'success', messages: [ i18n.__('delete-image-success') ] });
        return res.redirect('back');
      });
    });
  }
};
