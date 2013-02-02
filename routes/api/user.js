/*
 * API routes for user
 */
var User = require('../../models/user')
  , i18n = require('i18n')
  , _ = require('lodash');

module.exports = {
  /*
   * Function to register a user with the service
   */
  register: function(req, res) {
    // Find the user with this weiboId
    User.findOne({ weiboId: req.body.weiboId }, function(err, user) {
      if (err) {
        console.error(err);
        return res.json({
          status: 0,
          error: [i18n.__('system-error')]
        });
      }

      if (!user) {
        // Create the new user instance
        user = new User({
          weiboId: req.body.weiboId,
          weiboSecret: req.body.weiboSecret
        });

        // Create the accessToken for this user
        user.createAccessToken(function(err) {
          if (err) {
            console.error(err);
            return res.json({
              status: 0,
              errors: [i18n.__('system-error')]
            });
          }

          console.log(user);

          return res.json({
            status: 1,
            items: [{ key: 'accessToken', value: user.accessToken }]
          });
        });
      } else {
        user.weiboSecret = req.body.weiboSecret;

        // Create new accessToken
        user.createAccessToken(function(err) {
          if (err) {
            console.error(err);
            return res.json({
              status: 0,
              errors: [i18n.__('system-error')]
            });
          }

          console.log(user);

          return res.json({
            status: 1,
            items: [{ key: 'accessToken', value: user.accessToken }],
            message: i18n.__('success-get-token')
          });
        });
      }
    });

  }
};
