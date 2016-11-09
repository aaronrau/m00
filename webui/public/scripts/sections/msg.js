/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
  "use strict";
  /*
  example of global access app.Mod({Name of Module}).Controller.
  */
	var Notification = app.Mod('msg').Notification;
	var Input = app.Mod('msg').Input;


	//private variables
	var _SECTION = 'msg';
	var _container = null; //parent container for the section
	var _hasRender = false; //flad used to determine if the section has already been rendered on the screen;

	var _lastData = null;
	var _items = [];

	var _CTRL = function(){
		return app.Mod(_SECTION).Controller;
	}

	var elm = cELM('div',_SECTION);

	var content = cELM('div','content');
	var controls = cELM('div','controls');

	var loadingSpinner = cELM('div','background_text');
	loadingSpinner.innerHTML = 'Loading...';

	var btClearAll = cELM('div','button btClearAll');
	btClearAll.onclick = function(e){
		_CTRL().dismissChannelNotification(null,function(){},function(e){console.log(e)});
		_CTRL().notificationWidget.update([]);
	}


	var inputControl = new Input({
		placeHolder:"Say something…",
		hasCancel:true,
		postData:function(text,meta,callback)
		{

			 var cb = callback;
			 var mt = meta;

			 if(!IsEmpty(text))
			 {
			 	var replyToMessageId = null;
			 	if(mt)
			 	{
			 		if(mt.replyToMessageId)
			 		{
			 			replyToMessageId = mt.replyToMessageId;
			 		}
			 		else
			 		{
			 			replyToMessageId = mt.objectId;
			 		}
			 	}

			 	_CTRL().postMessage(mt.referenceId,mt.channelId,replyToMessageId,text,function(result){

			 		for(var i = 0; i < _items.length; i++)
			 		{
			 			var notification = _items[i];
			 			var nData = notification.getData();

			 			if(nData.objectId == mt.channelId)
			 			{
			 				var msgs = nData.messages;

			 				var replyToIndex = msgs.length-1;

			 				for(var j = 0; j < msgs.length; j++)
			 				{
			 					//find the last reply to index and insert the comment
			 					if(msgs[j].objectId == replyToMessageId)
			 						replyToIndex = j;

			 					if(msgs[j].replyToMessageId)
			 					if(msgs[j].replyToMessageId == replyToMessageId)
			 						replyToIndex = j;
			 				}

			 				if(replyToIndex != msgs.length-1)
			 					nData.messages.splice(replyToIndex+1, 0, result);
			 				else
			 					nData.messages.push(result);

			 				notification.update(nData);
			 			}
			 		}
			 		callback(null,result);

				 },function(error){
				 	callback(error,null);
				 });
			 }
			 else
			 {
			 	callback("Please enter a valid text",null);
			 }
		},
		onShow:function(){
			app.Controller.lockWindow();
			_CTRL().stopObserver();
			setTimeout(function(){

				inputControl.focus(); //ar: Only works in Salari Mobile IOS8 when in full screen mode
			},200)

		},
		onHide:function(){

			app.Controller.unlockWindow();
			_CTRL().startObserver();

		},
		onBlur:function()
		{
			inputControl.show(false);
		}
		});


	var onReply = function(meta)
	{
		var text = '';

		if(!IsEmpty(meta.fromUser.username))
			text = '@'+meta.fromUser.username+ ' ';

		inputControl.setText(text,meta);
		inputControl.show(true);

	}

	var onProfile = function(data,elm)
	{
		console.log(data);

	}

	var _checkData = function()
	{
		if(_items.length == 0)
		{
			loadingSpinner.innerHTML = 'No New Messages';
			loadingSpinner.style.display = 'block';
		}
		else
		{
			loadingSpinner.innerHTML = 'Loading...';
			loadingSpinner.style.display = 'none';
		}
	}

	var onDismiss = function(objectId)
	{
		var idxRemove = -1;
		for(var j = 0; j < _items.length; j++)
		{
			var eId = _items[j].getData().objectId;
			if(eId == objectId)
			{
				idxRemove = j;
				break;
			}
		}

	    if(idxRemove > -1)
	    {

			_items.splice(idxRemove, 1);
			_CTRL().notifications.splice(idxRemove, 1);
			_CTRL().dismissChannelNotification(objectId,function(result){},function(error){});
	    }

		_checkData();

	}

	var onClickMore = function(data)
	{

		console.log(data);
		var params =  {
			titleData:{},
			items:[],
			selectedItem:data.referenceObject,
			selectedItemIdx:0
		};

	}


	var _notificationHeaderTemplate = "<div class='next-guests card'>"+
        "<span class='content-left'><span class='name'>{{referenceObject.guest.name}}</span><br><br>" +
        	"<span class='people-icon'> {{referenceObject.people}} </span>"+
        	"<span class ='phone-icon'> {{referenceObject.guest.phone}} </span>"+
        "</span>"+
        "<span class='content-right'>"+
        	"{{referenceObject.formattedStart}}-{{referenceObject.formattedEnd}}<br>"+
        	"{{referenceObject.status}} <br>"+
        	"{{referenceObject.rentalAmount}}<br>"+
        "</span><br>"+

      "</div>";


  	var _this = {
		init:function(currentUser,container,titleArea,badge){

			_container = container;


			_CTRL().initLabelCount(badge);

			_CTRL().initObserver();


		},
		clear:function()
		{
			if(_container)
			{
			  _container.removeChild(elm);
			}
		},
		render:function()
		{


			_container.addELM(elm);


			if(_hasRender)
			{
			  return;
			}

			_CTRL().notificationWidget = _this;

			elm.addELM(content);
			elm.addELM(loadingSpinner);
			elm.addELM(controls);

			controls.addELM(inputControl);

			// elm.addELM(loadingSpinner);

			_hasRender = true;
		},
	    //view / section specific functions
	    update:function(data)
		{
			_lastData = data;


			for(var j = 0; j < _items.length; j++)
			{
				content.removeELM(_items[j]);
			}

			_items = [];


			for(var i = 0; i < data.length; i++)
			{
				// console.log('message?',data[i]);

				var entry = new Notification(data[i],onReply,onDismiss,onClickMore,onProfile, _notificationHeaderTemplate);
				content.insertELM(entry);
				_items.push(entry);
			}

			window.scrollTo(0,document.body.scrollHeight);

			_checkData();

		}
   }


  //Main module definition.
  define(_this);
}());


