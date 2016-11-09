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
	 app.Mod(_SECTION).Controller;

	Sequence of Events on Click Section Footer Buttons or on PageLoad
	1. _this.clear 
		Called on the previcous selected / active section
	
	2. _this.init 
		Only gets called the first time a section is loaded
	
	3. _this.render
		Gets called everytime a section is rendered

	*/


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
	var _SECTION = 'demo';
	var _popUp = null;
	var _container = null; //parent container for the section
	var _hasRender = false; //flad used to determine if the section has already been rendered on the screen;
	
	
	var _visibilityTimer = null;

 	var elm = cELM('div',_SECTION),
 		btAddList = cELM('div','button btAddList'),
 		loadingSpinner = cELM('div','background_text'),
 		notification = cELM('div','notification_area');
    

 	notification.style.display = 'none';

	var _CTRL = function(){
		return app.Mod(_SECTION).Controller;
	}

 	btAddList.onclick = function(e){
 		if(!_popUp)
		{
			_popUp = new app.Popup();
		}
		
		var ePopupContent = new app.Mod('list').Entry({
			type:"list_new",
			mode:"edit"
		},function(list){

			console.log(list);
			//on create list
			if(!IsEmpty(list.title))
			{

				var params = {
					mode:"list_preview",
					data:list,
					delegate:_CTRL()
				}

				var d = new app.Mod('list').Template(params);

				elm.insertELM(d);

			}

			
			app.Controller.popPopup();

		});
		
		_popUp.init(ePopupContent);
		_popUp.show(true);
 	}




    loadingSpinner.innerHTML = 'Loading...';

    var _renderList = function(lData)
    {
		var params = {
			mode:"list_preview",
			data:lData,
			delegate:_CTRL()
		}

		var d = new app.Mod('list').Template(params);
		elm.addELM(d);

		_CTRL().cache(d);

		return d;	
    }

	var _onConnection = function(isAlreadyConnected){
		console.log("on connection");

		notification.style.display = 'block';
	    notification.innerHTML = 'connected';

	    setTimeout(function(){
			notification.style.display = 'none';
	    	notification.innerHTML = '';
	    },500)
		       	
    	if(!isAlreadyConnected)
    	{
    	}

		try{
			//elm.removeChild(loadingSpinner);
		}catch(ex){}


		}
	var _onUserStatus = function(){

		console.log("on user status");
		}


	var _this = {
	    //init is used to initialize the various parameters need to render the call
	    init:function(currentUser,container){
	    	_container = container;
	    },
	    clear:function()
	    {
	    	if(_container)
	    		_container.removeChild(elm);
	    },
	    render:function()
	    {
		
	    	
			var nElm = cELM('div','notification');
	    	nElm.innerHTML = "The List function has been moved to gojot.co. You will be redirected there shortly"
	    	app.Controller.setNotification(nElm)
		

	    	setTimeout(function(){
	    		app.Controller.setNotification("<div class='notification'>Redirecting You Now</div>");
	    		
	    		setTimeout(function(){
	    			window.location = "http://app.gojot.co";
	    		},1000);
	    		

	    	},3000)
	    	

	    },
	    update:function(results)
	    {
	    	for(var i = 0; i < results.length; i++)
	    	{
	    			var lData = results[i];
	    			
	    	}
	    }
	 }


     
	//Main module definition.
	define(_this);
}());
