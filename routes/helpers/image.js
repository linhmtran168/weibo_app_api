var _ = require('lodash')
  , fs = require('fs')
  , crypto = require('crypto')
  , i18n = require('i18n');

// Upload image for shop
exports.uploadImage = function(file, callback) {
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
      

      // Delete the temporary image
      process.nextTick(fs.unlink(tmpPath, function(err) {
        if (err) {
          console.error(err);
        }

        console.log('Deleted the temporary image');
        return;
      }));

      // Return the new name of the image
      return callback(null, newName);
    });
};

// Delete image for shop
exports.deleteImage = function(fileName) {
  // If default image, do not delete
  if (fileName === 'no_image.png') {
    return;
  }

  var photoPath = './public/images/';

  // Delete the  photo
  process.nextTick(fs.unlink(photoPath + fileName, function(err) {
    if (err) {
      console.error(err);
      return;
    }

    console.log('Photo - successfully delete the photo');
  }));
};
