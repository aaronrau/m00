/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define(function(req_require, req_exports, req_module) {
return function(params){
	var _this = {};
	"use strict";
	//private variables

	var _data = params.data ? params.data : null;
	var _messages = [];
	var _participants = _data ? _data.participants :null;
	var _onProfile = params.onProfile;
	var _onPostCallback = params.onPostCallback;
	var _mode = params.mode;


	var _maxMessage = 999;


	var elm = cELM('div','conversation '+_mode);
	
	var controls = cELM('div','controls');
	var lblTitle = cELM('div','title');
	var content = cELM('div','content');
	var footer = cELM('div','footer');
	var tooltips = cELM('div','conversation_tooltip');
	
	var footer_input = null;/*new app.Mod('msg').Input({
	postData:function(e){},
	onShow:function(e){},
	onHide:function(e){},
	onBlur:function(e){},
	onFocus:function(e){}

	});*/

	if(params.input)
		footer_input = params.input;

	footer.addELM(footer_input);

	var btShowMore = cELM('div','btShowMore'); //elm.querySelector(".btShowMore");
	var btShowLess = cELM('div','btShowLess'); //elm.querySelector(".btShowLess");
	btShowLess.style.display = 'none';
	btShowMore.style.display = 'none';
	
	if(_mode == 'collapse') // only show 1 message but you can click on to expand
	{
		btShowLess.style.display = 'none';
		btShowMore.style.display = 'block';

		controls.addELM(btShowLess);
		footer.addELM(btShowMore);
	
	}
	else if(_mode == "open") // related to "collapse" but in a open /expanded state
	{
		btShowLess.style.display = 'block';
		btShowMore.style.display = 'none';

		controls.addELM(btShowLess);
		footer.addELM(btShowMore);
	
	}
	else if(_mode == "all")
	{

	}
	else if(_mode == "bottom") // have the message show up on the bottom
	{
		//content.addELM(tooltips);
	}

	

	btShowMore.onclick = function(event)
	{
		if (!event) var event = window.event;
	    event.cancelBubble = true;
		if (event.stopPropagation) event.stopPropagation();

		elm.className = "conversation open empty";
		btShowMore.className = "btAddNotes";

		if(_data)
		if(_data.messages)
		{
			if(_data.messages.length > 1)
			{
				elm.className = "conversation open";
				btShowMore.className = "btShowMore";
			}
		}
		
		footer_input.show(true);
		footer_input.getELM().style.display = 'block';

		setTimeout(function(){footer_input.focus();},500);
		

		btShowMore.style.display = 'none';
		btShowLess.style.display = 'block';
	}

	btShowLess.onclick = function(event)
	{
		if (!event) var event = window.event;
	    event.cancelBubble = true;
		if (event.stopPropagation) event.stopPropagation();

		elm.className = "conversation collapse empty";
		btShowMore.className = "btAddNotes";

		if(_data)
		if(_data.messages)
		{
			if(_data.messages.length > 1)
			{
				elm.className = "conversation collapse";
				btShowMore.className = "btShowMore"
			}
		}

		

		btShowMore.style.display = 'block';
		btShowLess.style.display = 'none';

		footer_input.show(false);
		footer_input.getELM().style.display = 'none';
	}


	var loadingSpinner = cELM('div','background_text');
	loadingSpinner.innerHTML = 'Loading...';
	loadingSpinner.style.display = 'none';

	

	//shuffle data so it's in the right order
	elm.className = "conversation " + _mode + ' empty';
	btShowMore.className = "btAddNotes";


	var _onReply =  function(meta)
	{
		var text = '';

		if(!IsEmpty(meta.fromUser.username))
			text = '@'+meta.fromUser.username+ ' ';

		meta.referenceId = _data.referenceId;

		footer_input.setText(text,meta);
		setTimeout(function(){footer_input.focus();},500);

		if(_mode == 'collapse')
		{	var e = {}
			btShowMore.onclick(e);
		}
	}

	_this.getRecent = function()
	{
		if(_messages.length > 0)
		{
			return _messages[_messages.length-1].getData();
		}
		else
		{
			return null;
		}
	}

	_this.getELM = function()
	{
		return elm;
	}
	_this.update = function(data)
	{

		if(_mode == "bottom")
		{

		}

		for(var j = 0; j < _messages.length; j++)
		{
			content.removeELM(_messages[j]);
		}
		
		_messages = [];

		if(data)
		{
			_data = data;
			/*
			var channel = data;
			var orderingHash = {}
			var sorted = [];

			for(var j = channel.messages.length -1; j >= 0 ; j--)
			{
			var msg = channel.messages[j];
			if(!channel.messages[j].replyToMessageId)
			{
			    orderingHash[msg.objectId] = {message:msg,replies:[]};
			}
			}

			for(var j = 0; j < channel.messages.length; j++)
			{
				var msg = channel.messages[j];
				if(channel.messages[j].replyToMessageId)
				{
				  if(orderingHash[msg.replyToMessageId])
				    orderingHash[msg.replyToMessageId].replies.push(msg);
				}
			}

			for(var n in orderingHash)
			{
				sorted.push(orderingHash[n].message);
				var messages = orderingHash[n].replies.reverse();

				for(var i =0 ; i < messages.length; i++)
				{
					sorted.push(messages[i]);
				}
			}     

			channel.messages = sorted;

			if(sorted.length > 0)
			{
				elm.className = "conversation " + _mode;
				btShowMore.className = "btShowMore"
			}*/

				

			for(var i = 0; i < _data.messages.length; i++)
			{
				var d = _data.messages[i];
				//var msg = null;
				var msg = new app.Mod('msg').Message(null,d,_onReply,_onProfile);

				/*
				if(_mode == 'collapse' || _mode == "open")
				{
					msg = new app.Mod('msg').Message('flat',d,_onReply,_onProfile);
				}
				else
				{
					msg = new app.Mod('msg').Message(null,d,_onReply,_onProfile);
				}*/
				
				_messages.push(msg);
				content.addELM(msg);

				
			}

			if(_mode == "bottom")
			{
				setTimeout(function(){
					content.scrollTop = content.scrollHeight;
				},200)
				
			}

		}	


	}

	_this.getHTML = function()
	{

		footer_input.setText(null,_data);

		if(_participants)
		{
			footer_note.update({
				participants:_participants
			});
		}


		elm.addELM(controls);
		//elm.addELM(lblTitle);
		elm.addELM(content);

	
		elm.addELM(footer);

	

		//elm.addELM(inputControl);



		footer_input.show(true);


		if(_mode == 'collapse' || _mode == "open")
		{
			
			footer_input.getELM().style.display = 'none';
		}
	
		
		return elm;
	}

	_this.getData = function()
	{
		return _data;
	}
	return _this;

};});

