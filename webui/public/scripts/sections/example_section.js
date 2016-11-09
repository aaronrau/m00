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


	//private variables
	var _SECTION = 'example_section';
	var _container = null; //parent container for the section
	var _hasRender = false; //flad used to determine if the section has already been rendered on the screen;


 	var elm = cELM('div',_SECTION),
 		loadingSpinner = cELM('div','background_text');
    
    loadingSpinner.innerHTML = 'Loading...';

	var _CTRL = function(){
		return app.Mod(_SECTION).Controller;
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
	    
	    	_hasRender = true;
	    }
	 }


     
	//Main module definition.
	define(_this);
}());
