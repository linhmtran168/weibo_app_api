
/*
 * Main entry for setting all the app routes
 */

exports.index = function(app){
  require('./admin')(app);
  // require('./api')(app);
};
