/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Yelp = function(config, callbackHandler,callbackErrorHandler) {
  
  var yelp = require("node-yelp");

  var TimeFrame = require('../utils/timeframe.js');

  var DataContext = require('../utils/datacontext.js');

  var SOURCE_TYPE = "yelp";

  var YELP_CONSUMER_KEY = config.ConsumerKey;
  var YELP_CONSUMER_SECRET = config.ConsumerSecret;
  var YELP_TOKEN = config.Token;
  var YELP_TOKEN_SECRET = config.TokenSecret;
  var YELP_APP_REDIRECT_URL = config.AppCallBackURL;

  var cbHandle = callbackHandler;
  var cbError = callbackErrorHandler;

  var client = yelp.createClient({
    oauth: {
      "consumer_key": YELP_CONSUMER_KEY,
      "consumer_secret": YELP_CONSUMER_SECRET,
      "token": YELP_TOKEN,
      "token_secret": YELP_TOKEN_SECRET
    },
    
    // Optional settings: 
    httpClient: {
      maxSockets: 25  // ~> Default is 10 
    }
  });

  return {
    auth:function(req, res) {
      res.redirect(YELP_APP_REDIRECT_URL);
    },
    authCallback: function(req, res) {
      var db = DataContext(req, true);
          
      var authData = {
          tokens: {
            consumer_key: YELP_CONSUMER_KEY,
            consumer_secret: YELP_CONSUMER_SECRET,
            accessToken: YELP_TOKEN,
            token_secret: YELP_TOKEN_SECRET
          },
          screen_name: 'Yelp'
      };

      var paramsAPI = {
          source: SOURCE_TYPE,
          sourceUserId: YELP_CONSUMER_KEY,
          OAuthData: JSON.stringify(authData)
      };

      cbHandle(req, res, paramsAPI);
    }
  };
}
module.exports = Yelp;
