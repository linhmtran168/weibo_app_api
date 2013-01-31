
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , i18n = require('i18n')
  , mongoose = require('mongoose')
  , RedisStore = require('connect-redis')(express)
  , passport = require('passport')
  , validator = require('express-validator')
  , flash = require('connect-flash')
  , errHandler = require('./configs/errorHandler');

// Configure i18n
i18n.configure({
  locales:['en', 'cn', 'jp'],
});

var app = express();

app.configure(function(){
  // Base configuration
  app.set('port', process.env.PORT || 3200);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser({
    keepExtensions: true
  }));


  // Use express-validator
  app.use(validator);
  app.use(express.methodOverride());

  // Static file
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));

  // Express Logger
  app.use(express.logger('dev'));

  // Session configuration
  app.all(/^(?!\/api).*$/,express.cookieParser('DragonLinhVoDich'));
  app.all(/^(?!\/api).*$/, express.session({
    store: new RedisStore({ db: 'weiboAppSessions', maxAge: 14400000 }),
    secret: 'DragonLinhVodich'
  }));

  // Passport initialization
  app.all(/^(?!\/api).*$/, passport.initialize());
  app.all(/^(?!\/api).*$/, passport.session());

  // Set up flash message
  app.all(/^(?!\/api).*$/, flash());

  // CSRf configuration
  app.all(/^(?!\/api).*$/, express.csrf());

  // Authentication configuration
  app.all(/^(?!\/api).*$/, function(req, res, next) {
    // Set the local user = req.user
    res.locals.currentUser = req.user;
    return next();
  });

  // Use i18n
  app.use(i18n.init);

  // Configure local variables
  // i18n in template
  app.locals({
    __: i18n.__,
    __n: i18n.__n
  });
  app.locals.slug = '';

  // Router configuration
  app.use(app.router);

  // Error Handler
  app.use(errHandler.logErrors);
  app.use(errHandler.clientErrorHandler);
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  mongoose.connect('mongodb://localhost:27017/weiboapp', { user: 'weiboadmin', pass: 'DragonLinhVoDich' });
});

app.configure('production', function() {
  app.use(express.errorHandler());
  mongoose.connect('mongodb://localhost:27017/weiboapp', { user: 'weiboadmin', pass: 'DragonLinhVoDich' });
});

// Passport configuration
require('./configs/passport').config(passport);

// Route for the app
require('./routes')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
