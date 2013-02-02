
/*
 * Main entry for setting all the app routes
 */

module.exports = function(app) {
  require('./admin')(app);
  require('./api')(app);
};
