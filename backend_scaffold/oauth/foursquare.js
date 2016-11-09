/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Foursquare = require('node-foursquare'),
  async = require('async');

var TimeFrame = require('../utils/timeframe.js');

var DataContext = require('../utils/datacontext.js');

var FoursquareSource = function (config, callbackHandler,callbackErrorHandler) {

  var cbHandle = callbackHandler;
  var cbError = callbackErrorHandler;
  var SOURCE_TYPE = "foursquare";

  var CLIENT_ID = config.ConsumerKey;
  var CLIENT_SECRET = config.ConsumerSecret;
  var allowSignUp = config.allowSignUp;

  var params = {
    secrets: {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUrl: config.AppCallBackURL
    }
  }

  var foursquare = new Foursquare(params);


  return {
    auth: function (req, res) {
      res.redirect(foursquare.getAuthClientRedirectUrl());
    },
    authCallback: function (req, res) {
      var queryCode = req.query.code;
      foursquare.getAccessToken({
        code: queryCode
      }, function (error, accessToken) {
        if (error) {
          console.log(error);
          res.send(error);
        }
        else {
          var db = DataContext(req, true);
          if (!db.sessionToken) {
            db = DataContext(req, true);
          }
          var authData = {
            tokens: {
              code: queryCode,
              accessToken: accessToken
            }
          };
          var paramsAPI = {
            source: SOURCE_TYPE,
            sourceUserId: CLIENT_ID,
            OAuthData: JSON.stringify(authData)
          };
          cbHandle(req, res, paramsAPI);
        }
      });
    }
  }
}
module.exports = FoursquareSource;