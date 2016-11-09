/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Security = function(ignoreFolders)
{
	var DataContext = require('../utils/datacontext.js');
	var _ignoreFolders = ['login','signup','css','images','scripts','test','auth','uploader'];

	if(ignoreFolders)
		_ignoreFolders = ignoreFolders;

	return {
		check:function (req, res, next) {
  
		   if(req.url == '/')
		   {
		   	 return next();
		   }

		   for(var i = 0; i < _ignoreFolders.length; i ++)
		   {
				if(req.url.indexOf(_ignoreFolders[i]) > -1)
				{
					return next();
					break;
				}
		   }

			var parseCookies = function(request) {
			    var list = {},
			        rc = request.headers.cookie;


			    rc && rc.split(';').forEach(function( cookie ) {
			        var parts = cookie.split('=');
			        list[parts.shift().trim()] = unescape(parts.join('='));
			    });
			    return list;
			}
			
			if(req.header('session_token'))
			{
				return next();
			}


			if(parseCookies(req))
			{
				var token = parseCookies(req).session_token;

				if(token)
				{
					if(token.length > 0)
					{
						return next();
					}
				}
			}

			
			var err = new Error('Permission Denied');
		  	err.status = 403;
			next(err);


		},
		handler:function(err, req, res, next){

			if(err)
			{
			  res.status(err.status || 403);


			
			  // respond with json
			  if (req.accepts('json')) {
			    res.send({ error: 'Permission Denied' });
			    return;
			  }
			  else
			  {
			 	 // respond with html page
			  	res.redirect('/login');
			    return;	
			  }
			}
			else
			{
				next();
			}


		  
		}
	}
}
module.exports = Security