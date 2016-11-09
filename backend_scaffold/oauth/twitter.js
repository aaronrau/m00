/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Twitter = require('twitter'),
  OAuth = require('oauth').OAuth,
  async = require('async');

var TimeFrame = require('../utils/timeframe.js');

var DataContext = require('../utils/datacontext.js');

var TwitterSource = function (config, callbackHandler,callbackErrorHandler) {

  var cbHandle = callbackHandler;
  var cbError = callbackErrorHandler;
  var SOURCE_TYPE = "twitter";

  var CONSUMER_KEY = config.ConsumerKey;
  var CONSUMER_SECRET = config.ConsumerSecret;
  var allowSignUp = config.allowSignUp;

  var twitterClient;

  var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    CONSUMER_KEY,
    CONSUMER_SECRET,
    "1.0",
    config.AppCallBackURL,
    "HMAC-SHA1"
  );


  return {
    //AUTH Related Endpoint Functions -----------------
    auth: function (req, res,parseKeys) {
      //user login
      oa.getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
        if (error) {
          console.log(error);

          cbError(req,res,error);
          
        }
        else {
          res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token)
        }
      });
    },
    authCallback: function (req, res,parseKeys) {


      //https://dev.twitter.com/rest/reference/get/account/verify_credentials

      var verifier = req.query.oauth_verifier;
      var requestToken = req.query.oauth_token;

      oa.getOAuthAccessToken(requestToken, "", verifier,
        function (error, oauth_access_token, oauth_access_token_secret, results) {
          if (error) {
            console.log(error);
            cbError(req,res,error);


            return;
          } else {
            var db = DataContext(req, parseKeys,true);
            if (!db.sessionToken) {
              db = DataContext(req, parseKeys,true);
            }

            //console.log(results);

            var authData = {
              tokens: {
                  accessToken: oauth_access_token,
                  tokenSecret: oauth_access_token_secret
              },
              user:{
                sourceFullname:results.name,
                sourceUserId:results.user_id,
                sourceUserName:results.screen_name,
                sourceUserProfilePic:'https://twitter.com/'+results.screen_name+'/profile_image?size=original',
              }
            };

            var paramsAPI = {
              source: SOURCE_TYPE,
              sourceUserId: results.user_id,
              OAuthData: JSON.stringify(authData)
            };

            if (!cbHandle)
              res.send(paramsAPI);
            else {
              cbHandle(req, res, paramsAPI);
            }
          }
        }
      );
    }
  }
}
module.exports = TwitterSource;