var _ = require('lodash')
  , fs = require('fs')
  , crypto = require('crypto')
  , i18n = require('i18n')
  , im = require('imagemagick');

// Upload image for shop
exports.uploadImage = function(file, callback) {
  var tmpPath = file.path
    , oldName = file.name
    , extension, newName, newPath
    , allowed_extensions = ['.gif', '.GIF', '.png', '.jpeg', '.jpg', '.JPG', '.JPEG'];

  console.log('Temp Path');
  console.log(tmpPath);
  // Get the extesion of the file
  extension = oldName.substr(oldName.lastIndexOf('.'));

  // Check extension
  if (!_.contains(allowed_extensions, extension)) {
    var err = {
      type: 'extension', 
      message: i18n.__('wrong-file-type')
    };

    return callback(err, false);
  }

  // Create the new image name by hashing the file path
  newName = crypto.createHash('md5').update(tmpPath).digest('hex') + extension;

  // Create the new path for the image
  newPath = './public/images/' + newName;

  // Try to upload the image
  fs.rename(tmpPath, newPath, function(err) {
    if (err) {
      console.error(err);
      var error = {
        type: 'system',
        message: i18n.__('system-error')
      };

      return callback(error, false);
    }
    
    // Return the new name of the image
    return callback(null, newName);
  });
};

// Function to upload image and thumbnail
exports.uploadImageWithThumb = function(file, callback) {
  var tmpPath = file.path
    , oldName = file.name
    , extension, newName, newPath
    , allowed_extensions = ['.gif', '.GIF', '.png', '.jpeg', '.jpg', '.JPG', '.JPEG'];

  // Get the extesion of the file
  extension = oldName.substr(oldName.lastIndexOf('.'));

  // Check extension
  if (!_.contains(allowed_extensions, extension)) {
    var err = {
      type: 'extension', 
      message: i18n.__('wrong-file-type')
    };

    return callback(err, false, false);
  }

  // Create the new image name by hashing the file path
  var digest = crypto.createHash('md5').update(tmpPath).digest('hex');
  newName =  digest + extension;
  newNameThumb = digest + '_thumb' + extension;

  // Create the new path for the image
  newPath = './public/images/' + newName;
  newPathThumb = './public/images/thumbs/' + newNameThumb;

  // Try to upload the raw image
  fs.rename(tmpPath, newPath, function(err) {
    if (err) {
      console.error(err);
      var error = {
        type: 'system',
        message: i18n.__('system-error')
      };
      
      return callback(err, false, false);
    }
    
    // resize and move the image
    im.resize({
      srcPath: newPath,
      dstPath: newPathThumb,
      width: 300
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      console.log(err);
      
      if (err) {
        console.error(err);
        var error = {
          type: 'system',
          message: i18n.__('system-error')
        };
        
        return callback(err, false, false);
      }
      
      // Return the new name of the image
      return callback(null, newName, newNameThumb);
    });
  });
};

// Delete image for shop
exports.deleteImage = function(fileName, isThumb) {
  var photoPath;
  // If default image, do not delete
  if (fileName === 'no_image.png') {
    return;
  }

  if (isThumb) {
    photoPath = './public/images/thumbs/';
  } else {
    photoPath = './public/images/';
  }

  // Delete the  photo
  process.nextTick(function() {
    fs.unlink(photoPath + fileName, function(err) {
      if (err) {
        console.error(err);
        return;
      }

      console.log('Photo - successfully delete the photo');
    });
  });
};
