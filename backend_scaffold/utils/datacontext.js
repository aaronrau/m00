
/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


//Argument Processing for misc variables
var PARAMS = require('./params.js')();
var port = PARAMS.PORT;
var URL = PARAMS.URL;

var DataContext = function(req,keys,isMaster){

	var APP_ID = keys.APP_ID;
	var REST_API = keys.REST_API;
	var MASTER_KEY = keys.MASTER_KEY;

	var parseCookies = function(request) {
	    var list = {},
	        rc = request.headers.cookie;

	    rc && rc.split(';').forEach(function( cookie ) {
	        var parts = cookie.split('=');
	        list[parts.shift().trim()] = unescape(parts.join('='));
	    });

	    return list;
	}


	var Parse = require('parse/node');
	Parse.initialize(APP_ID, REST_API,MASTER_KEY);
	Parse.serverURL = URL+ '/parse' // Don't forget to change to https if needed


	dataContext = {
		sessionToken:null,
		cloudRun:function(functionName,params,success,error)
		{
			

			try{
				if(isMaster)
				{
					Parse.Cloud.useMasterKey();	
				}
				else
				{
					params.sessionToken = dataContext.sessionToken;
				}
				
				Parse.Cloud.run(functionName, params, {
				    success: function(results) {
				      success(results);
				    },
				    error: function(er) {
				    	console.log(er)
				        error(er);
				    }
			    });
			}catch(ex){
				console.log(ex);
			}
		}
	}



	var token = parseCookies(req).session_token;

	if(token && !isMaster)
	{
		if(token.length > 0)
		{
			
			dataContext.sessionToken = token;

			return dataContext;
		}
	}

	token = req.header('session_token');
	if(token && !isMaster)
	{
		if(token.length > 0)
		{
			
				dataContext.sessionToken = req.header('session_token');

			return dataContext;
		}
	}

	if(isMaster)
	{
		dataContext.masterKey = keys.MASTER_KEY;
	}
	return dataContext;



}

module.exports = DataContext;