/*
 * Models for Admin
 */
var mongoose = require('mongoose')
  , bcrypt = require('bcrypt')
  , i18n = require('i18n')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var userSchema = new Schema({
  weiboId: { type: String, required: true, index: { unique: true } },
  weiboSecret: { type: String, required: true },
  accessToken: { type: String, index: true },
  deviceId: [String],
  images: [{
    name: { type: String, required: true, index: { unique: true } },
    thumbnail: { type: String, required: true, index: { unique: true } },
    description: String,
    uploadedAt: { type: Date, default: Date.now, index: true }
  }],
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true }
});

// Update timestamp before saving
userSchema.pre('save', function(next) {
  this.updateAt = new Date();
  next();
});

// Function to create the accessToken for a user
userSchema.methods.createAccessToken = function(callback) {
  var that = this;
  bcrypt.hash(this.id + this.weiboId + this.weiboSecret, 10, function(err, hash) {
    that.accessToken = hash;
    that.save(callback);
  });
};

var User = mongoose.model('User', userSchema);

module.exports = User;
