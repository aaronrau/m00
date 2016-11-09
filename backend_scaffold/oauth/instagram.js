/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Instagram = function(config, callbackHandler,callbackErrorHandler) {
  
  var api = require('instagram-node').instagram();

  var TimeFrame = require('../utils/timeframe.js');

  var DataContext = require('../utils/datacontext.js');

  var SOURCE_TYPE = "instagram";

  var INSTAGRAM_CLIENT_ID = config.ClientId;
  var INSTAGRAM_CLIENT_SECRET = config.ClientSecret;
  var INSTAGRAM_APP_REDIRECT_URL = config.AppCallBackURL;

  var cbHandle = callbackHandler;
  var cbError = callbackErrorHandler;
  
  api.use({
    client_id: INSTAGRAM_CLIENT_ID,
    client_secret: INSTAGRAM_CLIENT_SECRET
  });

  // Scopes
  // basic - to read data on a user’s behalf, e.g. recent media, following lists (granted by default)
  // comments - to create or delete comments on a user’s behalf
  // relationships - to follow and unfollow accounts on a user’s behalf
  // likes - to like and unlike media on a user’s behalf
  var instagramOauthUrlRedirect = api.get_authorization_url(INSTAGRAM_APP_REDIRECT_URL, { scope: ['likes'], state: 'a state' });


  return {
    auth:function(req, res) {
      res.redirect(instagramOauthUrlRedirect);
    },
    authCallback: function(req, res) {
      api.authorize_user(req.query.code, INSTAGRAM_APP_REDIRECT_URL, function(err, result) {
        if (err) {
          console.log(err.body);
          res.send("Didn't work");
        }
        else {
          var db = DataContext(req, true);
          
          var authData = {
              tokens: {
                  accessToken: result.access_token
              },
              user_id: result.user.id,
              screen_name: result.user.username
          };

          var paramsAPI = {
              source: SOURCE_TYPE,
              sourceUserId: result.user.id,
              OAuthData: JSON.stringify(authData)
          };

          cbHandle(req, res, paramsAPI);
        }
      });
    }
  }
}
module.exports = Instagram;