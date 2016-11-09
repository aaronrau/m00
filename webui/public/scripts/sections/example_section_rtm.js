
/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//Realtime Messaging Example
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
	var _SECTION = 'tacks';
	var _container = null; //parent container for the section
	var _hasRender = false; //flad used to determine if the section has already been rendered on the screen;
	var _popUp;

	var _visibilityTimer = null;

	var _CTRL = function(){
		return app.Mod(_SECTION).Controller;
	}

	var _content = cELM('div','content');
	
 	var elm = cELM('div',_SECTION),
 		btAdd = cELM('div','button btAdd');


//CRUD functions
	var _onRefresh = function()
	{

		app.Controller.clearNotification();	
		if(_popUp)
			_popUp.clearNotification();
		


        _CTRL().get(null,null,function(results){

        	if(results.length == 0)
        	{
        		_showButtons();	
        	}
        	else
        	{

        		_showButtons();	

        		for(var i = 0; i < results.length; i++)
        		{
        			var result = results[i];
        			_onAdd(result);	
        		}
        	
        	}

			
        	
        });		
	}
	
	var _onOnline = function(isAlreadyConnected)
	{	
		_onRefresh(); // AR: DO NOT HIT the DB on connect but rather on "online";	
	}


	var _onUserStatus = function(user)
	{
		_page.setUsers(user);
	}
	var _onConnection = function(isAlreadyConnected){

    	if(!isAlreadyConnected)
    	{
			//_onRefresh(); // AR: DO NOT HIT the DB on connect but rather on "online";
    	}
	}
	var _onConnectionError = function(){
		app.Controller.setNotification('Connection lost, reconnecting...');
		if(_popUp)
			_popUp.setNotification('Connection lost, please wait while we reconnect...');
		if(_inputControl)
			_inputControl.saveLocal();

	}

	var _onDisconnect = function(){
		
	}

	var _onAdd = function(data)
	{
		
	}

//Controls Logic---------------------------
	var _onClickAdd = function(e){

	}


//---------------------------

	var _showButtons = function()
	{

		btAdd.style.display = 'block';
		elm.style.display = 'block';
	}

	var _hideButtons = function()
	{
		btAdd.style.display = 'none';
		elm.style.display = 'none';
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
	    	_hideButtons();

	    	document.title = "Tacks";
	    	_container.addELM(elm);

			if(!app.User.get())
			{
				loginPopup(true);
				return;
			}
	    	
	    	var titleArea = document.getElementById('header_title');
			if(titleArea)
			{

	    		titleArea.addELM(btAdd);
			}

		
			//if has popup
			var parts = getURLParts(document.location);
			//console.log(parts);
			if(parts.length == 2)
			{

			}
			else
			{
		
		        _CTRL().bind("onConnectionError",_onConnectionError);
		        
		    	setTimeout(function(){

		    		app.Controller.setNotification('connecting...')
			        _CTRL().connect(_onConnection,_onOnline,_onConnectionError);
			       
					// Add a listener to detect visibility change state
					document.addEventListener(visibilityChange, function() {
						console.log(document[state]);

						if(document[state] == 'visible')
						{
							if(isMobile())
							{
			  					if(_visibilityTimer)
							    	clearTimeout(_visibilityTimer);

							    _visibilityTimer = setTimeout(function(){
								    _CTRL().connect(_onConnection,_onOnline,_onConnectionError);

							    },500)
							}
						}
						else if(document[state] == 'hidden')
						{

		 					if(isMobile())
							{
								//disconnect on mobile
							    if(_visibilityTimer)
							    	clearTimeout(_visibilityTimer);

							    _visibilityTimer = setTimeout(function(){

							   	    _CTRL().disconnect(function(){
								    	_onDisconnect();
								    });

							    },500)				    	
						    }
						}
						else
						{

						}

					}, false);

		   		},100);


			}
	    	
	    }
	 }


     
	//Main module definition.
	define(_this);
}());
