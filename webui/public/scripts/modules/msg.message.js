/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

define([
  "/scripts/libs/handlebars.min.js"
  ],function(Handlebars) {

	Handlebars.registerHelper('username_or_email', function(data) {
		var username = data.username;

		if(!IsEmpty(username))
		{
			return new Handlebars.SafeString("@"+username);
		}
		else
		{
			return  new Handlebars.SafeString(data.email);
		}

	});


	Handlebars.registerHelper('mentions', function(text) {

		if(!IsEmpty(text))
		{
			var escapedText = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\\^\$\|]/g, "\\$&");
			var mentionedUsernames = [];
			var replacedText = text;
			var pattern =/\B@[.a-z0-9_-]+/gi;
			var mnames = escapedText.match(pattern);
			if(mnames)
			for(var i = 0; i < mnames.length; i++)
			{
			  mentionedUsernames.push(mnames[i]);		
			  replacedText = replacedText.replace(mnames[i],'<span class="username">'+mnames[i]+'</span>');
			}

			return new Handlebars.SafeString(replacedText);
		}
		else
		{
			return  new Handlebars.SafeString("");
		}

	});


	var message_content = 
	'{{#fromUser}}<div class="profile i{{id}}"><div class="fullname">{{fullname}}</div><div class="username">{{username_or_email this}}</div><img src="{{profileURL}}"/></div>{{/fromUser}}'+
	'<div class="msg_text">{{mentions text}}</div>';

	var message_template = Handlebars.compile(message_content);

  return function(mode,data,onReply,onProfile){
    "use strict";


    var _this = {};
   

	var _data = data;
	var _mode = mode;
	var _onReply = onReply;
	var _onProfile = onProfile;

	var elm = cELM('div','message');
	var controls = cELM('div','controls');
	var content = cELM('div','content');



	var btReply = cELM('a','button btReply');
	btReply.onclick = function(event)
	{
	   
		if (!event) var event = window.event;
        event.cancelBubble = true;
    	if (event.stopPropagation) event.stopPropagation();


		_onReply(_data,btReply);
	}

	/*
	content.onclick = function(e)
	{
		_onReply(_data);
	}*/
	_this.getData = function(){
		return _data;
	}
	_this.getELM = function()
	{
		return elm;
	}
	_this.getHTML = function()
	{

		elm.addELM(controls);
		controls.addELM(btReply);

		elm.addELM(content);


		if(_data.replyToMessageId)
		{
			elm.className = "message_reply";

			if(_mode)
			if(_mode == "flat")
			{
				elm.className = "message";
			}
		}
		else
		{
			elm.className = "message";
		}

		if(!_data.fromUser)
		{
			_data.fromUser = {};
			_data.fromUser.profileURL = '/images/profile_default.png';
		}
		else if(IsEmpty(_data.fromUser.profileURL))
		{
			_data.fromUser.profileURL = '/images/profile_default.png';
		}	
		var result = message_template(_data);
		content.innerHTML = result;
		
		var profile = elm.querySelector(".profile");
		profile.onclick = function(event)
		{

			if (!event) var event = window.event;
            event.cancelBubble = true;
        	if (event.stopPropagation) event.stopPropagation();

        	if(_onProfile)
        	{
        		_onProfile(_data.fromUser.username,profile);
        	}

		}

		return elm;
	}
    
    return _this;
	}

});

