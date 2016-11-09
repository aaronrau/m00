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

	var template = Handlebars.compile(
		'{{#each assignees}}'+
		'<div class="name"> {{name}} </div>'+
		'{{/each}}'+
		"<div class='occupants'>{{meta.occupants}}</div>"+
		"<div class='start'>{{startAt}}</div>"+
		"<div class='end'>{{endAt}}</div>"+
		"<div class='image'></div>"
		);

	return function(params){
		"use strict";
		var _this = this;
		/*
		data:task assignment reminder + response
		{
			schedule:{
				task:{

				},		
			}
		
			status:"", // different states of completeness;
			value:"", // value enter for the current stat of the task
		}*/

		//private variables
		var _CLASS = "component_name",
			_params = params,
			_data = params.data,
			_mode = params.mode,
			_type = params.type;


		//DOM elements / templates here
	 	var _elm = cELM('div',_CLASS);


		//console.log(_task);
		console.log(_data);

		//public methods here
		_this.update = function(status,value,callback)
		{
			var results = {};


			callback(results);
		}

		//core framework methods 
		_this.getELM = function()
		{ //just returns the main element
			return _elm;
		},
		_this.getHTML = function()
		{ //build / render html elements here

			_elm.innerHTML = template(_data);

			return _elm;
		}

		return _this;

	 };

});
