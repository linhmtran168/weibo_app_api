/*
 * Models for Admin
 */
var mongoose = require('mongoose')
  , bcrypt = require('bcrypt')
  , i18n = require('i18n')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var adminSchema = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  email: { type: String },
  hash: { type: String, required: true },
  role: { type: String, enum: ['shopAdmin', 'superAdmin'], index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true }
});

// Update timestamp before saving
adminSchema.pre('save', function(next) {
  this.updateAt = new Date();
  next();
});


// Method to verify password
adminSchema.method('verifyPassword', function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

// Static method to authenticate a user
adminSchema.static('authenticate', function(username, password, callback) {
  this.findOne({ username: username }, function(err, admin) {
    // If error return error
    if (err) {
      return callback(err, false, { message: i18n.__('system-error') });
    }

    // No user
    if (!admin) {
      return callback(null, false, { message: i18n.__('no-username') });
    }

    // Verify password
    admin.verifyPassword(password, function(err, isCorrect) {
      // If erro
      if (err) {
        return callback(err, false, { message: i18n.__('system-error') });
      }

      // If password not correct return false
      if (!isCorrect) {
        return callback(null, false, { message: i18n.__('wrong-password') });
      }

      // Return the user
      return callback(null, admin, { message: i18n.__('authenticated') });
    });
  });
});

var Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
