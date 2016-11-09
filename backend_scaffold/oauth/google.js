/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


var GoogleSource = function(config,callbackHandler,callbackErrorHandler){
	
	//http://dannysu.com/2014/01/16/google-api-service-account/
	//http://www.bentedder.com/server-to-server-authorization-for-google-analytics-api-with-node-js/

	var cbHandle = callbackHandler;
	var cbError = callbackErrorHandler;
	var SOURCE_TYPE = "google";

	var googleapis = require('googleapis');
	var TimeFrame = require('../utils/timeframe.js');
	var DataContext = require('../utils/datacontext.js');

	var OAuth2 = googleapis.auth.OAuth2;
	//-----------Auth google

	var GOOGLE_JSONPEM = config.PEM


	var GOOGLE_CLIENT_ID = config.ClientId; 
	var GOOGLE_CLIENT_SECRET = config.CLIENT_SECRET; 
	var GOOGLE_REDIRECT_URL = config.AppCallBackURL; 

	
	
	var googOauth2Client = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);
	var googOauthUrlRedirect = googOauth2Client.generateAuthUrl({
		  	access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token) 
		  	//scope: ['https://www.googleapis.com/auth/analytics.readonly'] // If you only need one scope you can pass it as string 
			//scope: ['https://www.googleapis.com/auth/userinfo.profile'] // If you only need one scope you can pass it as string 
			scope: ['https://www.googleapis.com/auth/userinfo.email','https://www.googleapis.com/auth/userinfo.profile'] // If you only need one scope you can pass it as string 
	

	});

	


	var _authorizeBasic = function(parseKeys,tokens,req,res)
	{
		var authClient = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);
		authClient.setCredentials(tokens);

		var plus = googleapis.plus('v1');
		plus.people.get({ userId: 'me', auth: authClient }, function(err, result) {

			if(!err)
			{
				//console.log(result);
				
				var db = DataContext(req,parseKeys)
			  	if(!db.sessionToken)
			  	{
			  		db = DataContext(req,parseKeys,true);
			  	}

			  
	
				var defaultEmail = null;
				var username = null;
				for(var i = 0; i < result.emails.length; i++)
				{
					var em = result.emails[i];
					defaultEmail = em.value;
					break;
				}

				if(defaultEmail)
				{
					var un = defaultEmail.split('@');
					username = un[0];
				}

				if(!username)
				{
					if(result.displayName)
						username = result.displayName.toLowerCase().replace(' ','.');
					else
						username = result.id;
				}
					

				var authData = {
					tokens:tokens,
					user:{
						sourceFullname:result.displayName,
						sourceUserName:username,
				  		sourceUserProfilePic:result.image.url,
				  		sourceUserEmail:defaultEmail
					},
					raw:result

				}
				
				var params = {
				  source: SOURCE_TYPE,
				  sourceUserId:result.id,
				  OAuthData:JSON.stringify(authData)

				};


				if(!cbHandle)
					res.send(params);
				else
					cbHandle(req,res,params);
				

			}
			else
			{
				res.send(err);
			}


		});


	}

	var _authorizeAnalytics = function(parseKeys,tokens,req,res){
		var authClient = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);
		authClient.setCredentials(tokens);

		var analytics = googleapis.analytics('v3');

		analytics.management.profiles.list({ 
			auth: authClient,
			'accountId': '~all',
			'webPropertyId': '~all',
		}, function(err, result) {

			

			if(!err)
			{
				
				var db = DataContext(req,parseKeys)
			  	if(!db.sessionToken)
			  	{
			  		db = DataContext(req,parseKeys,true);
			  	}

			  
				var authData = {
					tokens:tokens,
					accounts:result
				}
	

				var params = {
				  source: SOURCE_TYPE,
				  sourceUserId:result.username,
				  OAuthData:JSON.stringify(authData)

				};


				if(!cbHandle)
					res.send(params);
				else
					cbHandle(req,res,params);


			}
			else
			{
				res.send(err);
			}


		});

	}

	var _authHandler = function(req,res,callback)
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
	  			accounts[i] = "ga:"+ accounts[i];
	  		}
	  	}

		var db = DataContext(req);
		var params = {
			where:{source:"google"}
		}

		if(objectId)
			params.where = {source:"google",objectId:objectId};
		
		db.getObjects('OAuth', params, function(perr, pres, pbody, success) {
			if(!perr)
			{
				if(pbody.length == 1)
				{
					var authData = JSON.parse(pbody[0].OAuthData);
					var tokens = authData.tokens;

					var authClient = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL);
						authClient.setCredentials(tokens);		
					
					for(var i =0;  i < authData.accounts.items.length; i++)
					{
						var account = authData.accounts.items[i];
						accounts.push(account.id)
					}

					callback(authClient,accounts[0]);

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

	//AR: TODO get it working
	var _checkAndRefreshToken = function(req,sourceUserId,authData,callback)
	{
		var tokens = authData.tokens;
		var today = new Date();
		var todayTime = today.getTime()
		if(tokens.expiry_date  > todayTime-1000*6)
		{
			return googOauth2Client.refreshToken_(refresh_token, function(err, tokens) {

					var db = DataContext(req)
				  	if(db.sessionToken) //Is the user already logged in?
				  	{
				  		var newAuthData = authData;

				  		authData.tokens.access_token = tokens.access_token;
						authData.tokens.expiry_date = tokens.expiry_date;
						authData.tokens.token_type 	= tokens.token_type;

				  		var params = {
						  source: SOURCE_TYPE,
						  sourceUserId:sourceUserId,
						  OAuthData:JSON.stringify(newAuthData)

						};

				  		params.signupType = "link";
						db.cloudRun('oauthLink', params, function(perr, pres, pbody, success) {
							//res.send(pbody);
							callback(tokens);
						});
				  	}


				});
		}
		else
		{
			return callback(tokens);
		}


	
		
	}

	return {
//AUTH Related Endpoint Functions -----------------
		auth:function(req, res, parseKeys)
		{
			res.redirect(googOauthUrlRedirect);
		},
		authCallback:function(req, res, parseKeys)
		{
			googOauth2Client.getToken(req.query.code, function(err, tokens) {



				if(!err) {
					
					return _authorizeBasic(parseKeys,tokens,req,res);

					//return _authorizeAnalytics(parseKeys,tokens,req,res);

				}
				else
				{
					res.send(err);
				}
			});
		}
	}
}


module.exports = GoogleSource;