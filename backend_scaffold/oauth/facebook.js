/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Facebook = function(config,callbackHandler,callbackErrorHandler){

	var FB = require('fb')
	var TimeFrame = require('../utils/timeframe.js');
	var DataContext = require('../utils/datacontext.js');

	var cbHandle = callbackHandler;
	var cbError = callbackErrorHandler;
	var SOURCE_TYPE = "facebook";

	var FACEBOOK_APP_ID = config.AppId 
	var FACEBOOK_APP_SECRET = config.AppSecrect;
	var FACEBOOK_APP_REDIRECT_URL = config.AppCallBackURL;
	
	
	var facebookOauthUrlRedirect = FB.getLoginUrl({
		appId:FACEBOOK_APP_ID,
		redirectUri:FACEBOOK_APP_REDIRECT_URL,
		display:'popup',
		scope:"public_profile"
	});

	
	var _authHandler = function(req,res,parseKeys,callback)
	{
		var accounts = [];

		//data source related header parameters to handle multiple accounts per user oauth as well as multiple oauth
	  	var objectId = req.header('ds_auth_ref');
	  	var accountString = req.header('ds_account');
	  	
	  	if(accountString)
	  	{
	  		accounts = accountString.split(',');
	  		for(var i  in accounts)
	  		{
	  			accounts[i] = accounts[i];
	  		}
	  	}

		var db = DataContext(req);
		var params = {
			where:{source:"facebook"}
		}

		if(objectId)
			params.where = {source:"facebook",objectId:objectId};
		
		db.getObjects('OAuth', params, function(perr, pres, pbody, success) {
			if(!perr)
			{
				if(pbody.length == 1)
				{
					var authData = JSON.parse(pbody[0].OAuthData);
					var tokens = authData.tokens;

					if(accounts.length == 1)
					{
						var fb_account_id = accounts[0];
						var page_token = null;

						//console.log(fb_account_id);
						
						for(var i =0;  i < authData.accounts.data.length; i++)
						{
							var account = authData.accounts.data[i];

							if(fb_account_id == account.id)
							{
								page_token = account.access_token;

								break;
							}
						}

						if(!page_token)
						{
							res.status(406).send("missing page token?");
						}
						else
						{
							var authClient = require('fb');
							
							authClient.setAccessToken(page_token);
							callback(authClient,fb_account_id);
						}

					

					}
					else
					{
						res.status(406).send("ds_auth_ref is missing from the request header or is invalid");
					}

				

				}
				else if(pbody.length > 1)
				{
					res.status(406).send("ds_auth_ref is missing from the request header or is invalid");
				}
				else
				{
					res.status(406).send("Something is missing from the request header or is invalid");
				}
			}
			else
			{
				res.status(500).send(perr);
			}
		});
	}

return {
		//AUTH Related Endpoint Functions -----------------
		auth:function(req, res,parseKeys)
		{
			//user login

			res.redirect(facebookOauthUrlRedirect);

			
		},
		authApp:function(req,res,parseKeys)
		{
			//Authorize App
			FB.api('oauth/access_token', {
			    client_id: FACEBOOK_APP_ID,
			    client_secret: FACEBOOK_APP_SECRET,
			    grant_type: 'client_credentials'
			}, function (result) {
			    if(!result || result.error) {
			        console.log(!result ? 'error occurred' : result.error);
			        cbError(req,res,result);
			        return;
			    }
			 	//console.log(result);
			    var accessToken = result.access_token;
			    var accessTokenExpires = result.expires ? result.expires : 0;

			    res.send(result);
			});
		},
		authCallback:function(req, res,parseKeys)
		{
			
			FB.api('oauth/access_token', {
			    client_id: FACEBOOK_APP_ID,
			    client_secret: FACEBOOK_APP_SECRET,
			    redirect_uri: FACEBOOK_APP_REDIRECT_URL,
			    code: req.query.code
			}, function (result) {
			    if(!result || result.error) {
			        console.log(!result ? 'error occurred' : result.error);
			        cbError(req,res,result);

			       return;
			    }

			    var shortLiveAccessToken = result.access_token;
			    var shortLiveAccessTokenExpires = result.expires ? result.expires : 0;

			
				FB.api('oauth/access_token', {
				    client_id: FACEBOOK_APP_ID,
				    client_secret: FACEBOOK_APP_SECRET,
				    grant_type: 'fb_exchange_token',
				    fb_exchange_token:shortLiveAccessToken
				}, function (result) {
				    if(!result || result.error) {
				        console.log(!result ? 'error occurred' : result.error);

				        cbError(req,res,result);
				        
				        return;
				       
				    }
				    
				    var longLiveToken = result.access_token;
  					var longLiveTokenExpires = result.expires ? result.expires : 0;

					var fbR = require('fb');
					fbR.setAccessToken(longLiveToken);
					fbR.api('/v2.3/me', function (result) {
					  if(!result || result.error) {
					    console.log(!result ? 'error occurred' : result.error);

					    cbError(req,res,result);
					    return;
					    
					  }

					  	var authData = {
							tokens:{
								long_access_token:longLiveToken,
								long_access_token_expires:longLiveTokenExpires,
								short_access_token:shortLiveAccessToken,
								short_access_token_expires:shortLiveAccessTokenExpires
							},
							user:{
								sourceFullname:result.name,
								sourceUserId:result.id,
  								sourceUserName:result.name.toLowerCase().replace(' ','.'),
						  		sourceUserProfilePic:'http://graph.facebook.com/'+result.id+'/picture?width=200&height=200',
							}
						}

						var params = {
						  source: SOURCE_TYPE,
						  sourceUserId:result.id,
						  OAuthData:JSON.stringify(authData)
						};
					
						fbR.api('/v2.3/me/accounts', function (accounts) {
							  if(!accounts || accounts.error) {
							    console.log(!accounts ? 'error occurred' : accounts.error);
							    cbError(req,res,accounts);
							    return;
							  }

							  authData.accounts = accounts;
							  params.OAuthData = JSON.stringify(authData);

							if(!cbHandle)
								res.send(params);
							else
								cbHandle(req,res,params);


						});

					});
				   
				});
			});

		}
	};

}



module.exports = Facebook;
