/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define(function(req_require, req_exports, req_module) {
return function(params){
	"use strict";
	var _this = {};

	//private variables
	var _CLASS = "component_name",
		_params = params,
		_data = params.data,
		_mode = params.mode,
		_type = params.type;

	

	//DOM elements / templates here
	var _elm = cELM('div',_CLASS);

	//public methods here
	_this.update = function(data,callback)
	{
		var results = {};
		_data = data;

		callback(results);
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

	return _this;

};});
