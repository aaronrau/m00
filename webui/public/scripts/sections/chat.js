
/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
	"use strict";


	// Adapted slightly from Sam Dutton
	// Set name of hidden property and visibility change event
	// since some browsers only offer vendor-prefixed support
	var hidden, state, visibilityChange; 
	if (typeof document.hidden !== "undefined") {
		hidden = "hidden";
		visibilityChange = "visibilitychange";
		state = "visibilityState";
	} else if (typeof document.mozHidden !== "undefined") {
		hidden = "mozHidden";
		visibilityChange = "mozvisibilitychange";
		state = "mozVisibilityState";
	} else if (typeof document.msHidden !== "undefined") {
		hidden = "msHidden";
		visibilityChange = "msvisibilitychange";
		state = "msVisibilityState";
	} else if (typeof document.webkitHidden !== "undefined") {
		hidden = "webkitHidden";
		visibilityChange = "webkitvisibilitychange";
		state = "webkitVisibilityState";
	}



	//private variables
	var _SECTION = 'chat';
	var _container = null; //parent container for the section
	var _hasRender = false; //flad used to determine if the section has already been rendered on the screen;


	var _visibilityTimer = null;

	var _CTRL = function(){
		return app.Mod(_SECTION).Controller;
	}

	var Input = app.Mod(_SECTION).Input;
	var Room = app.Mod(_SECTION).Room;


 	var elm = cELM('div',_SECTION),
 		loadingSpinner = cELM('div','background_text');
    
    loadingSpinner.innerHTML = 'Loading...';

    
    var room = new Room();

	var inputControl = new Input({
		placeHolder:"Say something…",
		postData:function(text,meta,callback)
		{
			 var cb = callback;
			 var mt = meta;

			 if(!IsEmpty(text))
			 {
			 	_CTRL().emit('message',{text:text});
			 	callback(null,text);
			 }
			 else
			 {
			 	callback("Please enter a valid text",null);
			 }
		},
		onShow:function(){},
		onHide:function(){},
		onBlur:function(){}
		});


	var _onUserStatus = function(user)
	{
		room.setUsers(user);
	}
	var _onConnection = function(isAlreadyConnected){

		room.status('done');

    	if(!isAlreadyConnected)
    	{
			_CTRL().watch('message',function(data){
				if(data)
					room.update(data);
			});    		
    	}

		try{
			elm.removeChild(loadingSpinner);
		}catch(ex){}

	}

	var _onDisconnect = function(){

	}

	var _this = {
	    //init is used to initialize the various parameters need to render the call
	    init:function(currentUser,container){

	    	_container = container;

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
	
	    	elm.addELM(loadingSpinner);

	        elm.addELM(room);
			elm.addELM(inputControl);

			inputControl.show(true);


	    	setTimeout(function(){
	    		room.status('connecting...');
		        _CTRL().connect(_onConnection,_onUserStatus);


				// Add a listener to detect visibility change state
				document.addEventListener(visibilityChange, function() {
					console.log(document[state]);

					if(document[state] == 'visible')
					{
	  					if(_visibilityTimer)
					    	clearTimeout(_visibilityTimer);

					    _visibilityTimer = setTimeout(function(){
					    	room.status('connecting...');
						    _CTRL().connect(_onConnection,_onUserStatus);

					    },500)
					}
					else if(document[state] == 'hidden')
					{

	 					if(isMobile())
						{
							//disconnect on mobile
						    if(_visibilityTimer)
						    	clearTimeout(_visibilityTimer);

						    _visibilityTimer = setTimeout(function(){

						   		room.status('disconnected');
							    _CTRL().disconnect(function(){

							    });

						    },500)				    	
					    }
					}
					else
					{

					}

				}, false);

	   		},100);


	    	_hasRender = true;
	    }
	 }


     
	//Main module definition.
	define(_this);
}());
