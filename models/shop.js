/*
 * Models for Shop
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var shopSchema = new Schema({
  admin: { type: ObjectId, required: true, ref: 'Admin', index: true },
  name: { type: String, required: true, index: true },
  avatar: { type: String, default: 'no_image.png' },
  location: {
    geoAddress: { type: String, index: true },
    coords: { type: Array, index: '2d' }
  },
  description: { type: String },
  address: { type: String },
  phoneNumber: { type: String },
  paymentOpts: { type: Array, default: ['Cash'] },
  openingHours: String,
  nearStations: [String],
  isWifi: { type: Boolean, default: true },
  languages: { type: Array, default: ['Japanese'] },
  customFields: [ { name: String, value: String } ],
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true },
});

shopSchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = new Date();
  next();
});

var Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
