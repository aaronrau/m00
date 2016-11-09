/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

define(function(req_require, req_exports, req_module){
return function(params){
	"use strict";
	var _this = this;

	//private variables
	var _CLASS = "chatroom",
		_userHash = {},
		_params = params;




	//DOM elements / templates here
	var _elm = cELM('div',_CLASS);
	var statusHeader = cELM('div',_CLASS+'_status');
	var userHeader = cELM('div',_CLASS+'_users');
	var content = cELM('div',_CLASS+'_content');
	_elm.addELM(statusHeader);
	_elm.addELM(userHeader);
	_elm.addELM(content);

	//public methods here
	_this.update = function(data,callback)
	{
		var message = cELM('div',message)
		message.innerHTML = data.text;
		content.addELM(message);
		window.scrollTo(0,document.body.scrollHeight);

	}

	var _setUserTimer = null;
	var _onUpdateSetUser = function(e)
	{

		userHeader.innerHTML = "";

		for(var u in _userHash)
		{
			var elmUser = cELM('div',_CLASS+'_user');
			userHeader.addELM(elmUser);
		}

		_userHash = {};

	}


	_this.setUsers = function(userStatus)
	{

		if(userStatus.user)
		{
			_userHash[userStatus.user.id] = userStatus.user;
		}
		else
		{
			_userHash[userStatus.socket] = userStatus;
		}
		
		if(_setUserTimer)
			clearTimeout(_setUserTimer)

		_setUserTimer = setTimeout(_onUpdateSetUser,500);
	}

	_this.status = function(status)
	{
		if(status)
		{
			
			if(status.toLowerCase() == "done")
			{
				setTimeout(function(){
					statusHeader.innerHTML = "Done";
					setTimeout(function(){
						statusHeader.style.display = "none";
					},1000)
				},1000)

			}
			else
			{
				statusHeader.innerHTML = "";
				statusHeader.style.display = 'block';

				statusHeader.innerHTML = status;
			}
		}


	}


	_this.clear = function()
	{
		content.innerHTML = "";
	}
	//core framework methods 
	_this.getELM = function()
	{ //just returns the main element
		return _elm;
	},
	_this.getHTML = function()
	{ //build / render html elements here

		_elm.className = _CLASS;


		return _elm;
	}

};});

