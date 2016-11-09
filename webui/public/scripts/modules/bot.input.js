/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define(function(req_require, req_exports, req_module) {
return function(params){
	var _this = this;
	"use strict";
	
	//private variables
	var _params = params;
	var _data = null;
	var _postData = params.postData;
	var _onShow = params.onShow;
	var _onHide = params.onHide;
	var _onBlur = params.onBlur;
	var _onFocus = params.onFocus;

	var _disablePostButton = params.disablePostButton;

	var _onBlurTimer = null;
	
	var loadingSpinner = cELM('div','sending');
	
	var elm = cELM('div','chat_input');
	elm.style.display = 'none';

	if(_params.isVisible)
	{
		elm.style.display = 'block';
	}
	else
	{
		elm.style.display = 'none';
	}
			
	var _post = function(text)
	{
		var txt = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		
	
		_postData(txt,_this.getData(),_end);
	}

	var input = cELM('input','input_text');
	
	if(params.placeHolder)
		input.placeholder = params.placeHolder;

	input.onkeypress = function(e) {
		if(e.keyCode == 13) 
		{
			_start();
			_post(input.value);
		}

		

	};
	// AR: werid hack otherwise input box doesn't work correclty on ios mobile
	input.onkeyup = function(e)
	{
		input.style.left = '' 
	}
	input.onkeydown = function(e)
	{
		input.style.left = '0px';
	}
	var btPost = cELM('a','button btPost');
	btPost.onclick = function(e)
	{
		

		clearTimeout(_onBlurTimer);
		_start();
		_post(input.value);

	}


	var btCancel = cELM('a','button btCancel');
	btCancel.onclick = function(e)
	{
		_this.show(false);
	}


	var _start = function(error,results)
	{
		input.orgDisplay = input.style.display;
		input.style.display = "none";

		btCancel.orgDisplay = btCancel.style.display;
		btCancel.style.display = "none";
		
		btPost.orgDisplay = btPost.style.display;
		btPost.style.display = "none";

		loadingSpinner.style.display = 'block';

		
		elm.addELM(loadingSpinner);

	}

	var _end = function(error,results)
	{

		input.style.display = input.orgDisplay;
		btCancel.style.display = btCancel.orgDisplay;
		if(!_disablePostButton)
			btPost.style.display = btPost.orgDisplay;

		elm.removeChild(loadingSpinner);

		if(!error)
		{
			input.value = "";
			//_this.show(false);
		}
		else
			alert(error);
	}

	input.onblur = function(e){

		if(_onBlur)
		{
			_onBlurTimer = setTimeout(function(e){
				_onBlur(e);
			},500)
		}
			
	}

	input.onfocus = function(e)
	{
		if(_onFocus)
		{
			_onFocus(e);
		}
	}


	_this.reset = function()
	{
		_end();
	}


	_this.postContent = function(callback)
	{
		elm.addELM(loadingSpinner);
		
		var text = input.value;

		var txt = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

		_postData(txt,_this.getData(),function(results){

			elm.removeChild(loadingSpinner);

			//_end(null,results);
			callback();

		});

	}

	_this.focus = function(){
	
		input.focus();
		var originalValue = input.value ;
		input.value = "";
		input.value = originalValue;


	}
	_this.show = function(isShow)
	{
		input.blur();
		if(_params.isVisible)
		{
			return;
		}

		if(isShow)
		{
			
			if(_onShow)
				_onShow()
		}
		else
		{
			if(_onHide)
				_onHide()
		}
		elm.style.display = isShow ? 'block' : 'none';

	}

	_this.getELM = function()
	{
		return elm;
	}
	_this.getHTML = function()
	{
		elm.addELM(input);
		if(!_disablePostButton)
			elm.addELM(btPost);

		if(_params.hasCancel)
			elm.addELM(btCancel);
		
		return elm;
	}

	_this.getData = function()
	{
		return _data;
	}
	_this.addText = function(text)
	{
		if(text)
		{
			var oTxt = input.value;
			if(oTxt)
				input.value = oTxt + ' ' +text;
			else
				input.value = text;
		}

	}
	_this.setText = function(text,data)
	{
		input.value = text;
		_data = data;
		
	}
	_this.getText = function()
	{
		return input.value;
	}

	return _this;

};});

