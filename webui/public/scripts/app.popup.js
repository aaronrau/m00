/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

app.Ext(app,{Popup:function(params){
		var Popup ={};
		var _this = Popup;
		var _content = null;
		var _params = params;
		var _cParams = null;

		//Private Property
		var _isDisableClosing = false;

		var _CLASS = "popup";
		var _setCLASSNAME = null;

		var elm = cELM('div','popup');
			elm.addEventListener("click", function(e){
				if (!e) var e = window.event;
            	e.cancelBubble = true;
        		if (e.stopPropagation) e.stopPropagation();
				
				if(!_isDisableClosing)
					app.Controller.popPopup();
			});

			
			elm.addEventListener("dragover", function(e) {
			    e.preventDefault();
			    elm.className = _CLASS + ' '+(_setCLASSNAME ? _setCLASSNAME : '')+" dragover";
			});
			elm.addEventListener("dragleave", function(e) {
			    e.preventDefault();
				elm.className = _CLASS + ' '+(_setCLASSNAME ? _setCLASSNAME : '');
			});
			elm.addEventListener("drop", function(e) {
			    e.preventDefault();
			    elm.className = _CLASS + ' '+(_setCLASSNAME ? _setCLASSNAME : '')
			    
			    var dt = e.dataTransfer;
			    
			    var types = dt.types;
			    var files = dt.files;
			    var items = dt.items;
				var url = dt.getData('url');
				
				if (!url) {
				    url = dt.getData('text/plain');
				    if (!url) {
				        url = dt.getData('text/uri-list');
				            if (!url) {
				                // We have tried all that we can to get this url but we can't. Abort mission
				                 //return;
				             }
				         }
				}

			    //AR: mock event so it can be used by dropzone
			    var saveEvent = {
			    	dataTransfer:{
			    		files:files,
			    		items:items,
			    		url:url
			    	}
			    }

			   	if(_content)
				if(_content.onDropEvent)
					_content.onDropEvent(saveEvent)
			    
			});



		var btBack = cELM('div','btBack');
		btBack.onclick = function()
		{
			app.Controller.popPopup();
		}
		var elmHeader = cELM('div','header');
		var elmHeaderTitleContainer = cELM('div','title_container');
		var elmHeaderTitle = cELM('div','title');
		//var elmHeaderTitle = cELM('input','title');
		elmHeaderTitle.readOnly = true;

		var elmNotificationArea = cELM('div','notification');
		var _notificationElm = null;

		var elmControls = cELM('div','header_controls');

		var elmContent = cELM('div','scroll_content');
		var spacer = cELM('div','scroll_spacer');
		elmContent.addELM(spacer);

		elmHeader.addELM(btBack);
		elmHeader.addELM(elmHeaderTitleContainer);
		elmHeaderTitleContainer.addELM(elmHeaderTitle);
		elmHeader.addELM(elmControls);

		if(_params)
		if(_params.mode)
		{
			elm.addELM(elmHeader);
			elm.addELM(elmNotificationArea);
			if(_params.controls)
			{
				for(var i = 0; i < _params.controls.length; i++)
				{
					var ctrl = _params.controls[i];
					elmControls.addELM(ctrl);
				}
			}

			elm.addELM(elmContent);
		}
		else
		{
			elm.addELM(elmNotificationArea);
		}


		if(!params)
		{
			elm.addELM(elmNotificationArea);
		}
		//var content = cELM('div','form');

		Popup.disableClosing = function(bool){
			_isDisableClosing = bool;

		};

		document.body.appendChild(elm);
		Popup.setClass = function(c)
		{
			_setCLASSNAME = c;

			elm.className = _CLASS+' '+_setCLASSNAME;
		}
		Popup.clearNotification = function(){
			var nt = elmNotificationArea;
			if(nt)
			{
			  if(_notificationElm)
			  {
			    nt.removeChild(_notificationElm);
			    _notificationElm = null;
			  }
			  else
			  {
			    nt.innerHTML = "";
			  }
			}
		}
		Popup.setNotification= function(elm)
		{
			var nt = elmNotificationArea;
			if(nt)
			{

			  if(_notificationElm)
			  {
			    nt.removeChild(_notificationElm);
			    _notificationElm = null;
			  }
			  else
			  {
			    nt.innerHTML = "";
			  }

			  if(typeof elm == 'string')
			  {
			     nt.innerHTML = elm;
			  }
			  else if (typeof elm == 'object')
			  {
			    _notificationElm = elm;
			    nt.addELM(elm)
			  }
			}
		}
		Popup.getTitle = function(){
			return elmContent.value;
		}
		Popup.init = function(c,cParams)
		{
			var additionalCSS = null;

			//console.log(c);
			//console.log(_content);

			Popup.clearContent();
			_content = c;
			_cParams = cParams;
			
			if(typeof cParams == 'string')
			{

				elm.addELM(_content);

				additionalCSS = cParams;
				if(additionalCSS)
				{
					Popup.setClass(additionalCSS)
				}

			}
			else if (typeof cParams == 'object')
			{
	
				if(cParams.title)
				{
					//elmHeaderTitle.value = cParams.title;
					elmHeaderTitle.innerHTML = cParams.title;
				}

				if(_params)
					elmContent.addELM(_content);
				else
					elm.addELM(_content);

				if(cParams.css)
					Popup.setClass(cParams.css)


				/*
				if(cParams.editable)
					elmHeaderTitle.readOnly = false;
				*/

				elm.addEventListener("click", function(e) {
					if (!e) var e = window.event;
		        	e.cancelBubble = true;
		    		if (e.stopPropagation) e.stopPropagation();


				});		


			}
			else
			{
				elm.addELM(_content);

				additionalCSS = cParams;
				if(additionalCSS)
				{
					Popup.setClass(additionalCSS)
				}
			}


		


			if(_content.hasOwnProperty('getELM'))
			{
				_content.getELM().addEventListener("click", function(e) {
					if (!e) var e = window.event;
		        	e.cancelBubble = true;
		    		if (e.stopPropagation) e.stopPropagation();
				});
			}
			else
			{
				_content.addEventListener("click", function(e) {
					if (!e) var e = window.event;
		        	e.cancelBubble = true;
		    		if (e.stopPropagation) e.stopPropagation();
				});				
			}
			


		}
		Popup.isShown = function()
		{
			return elm.style.display == "block";
		}
		Popup.clearContent = function()
		{
			
			if(_content)
			{
				if(_content.getELM)
				{
					if(_content.getELM().parentNode)
						_content.getELM().parentNode.removeChild(_content.getELM());					
				}
				else
				{
					if(_content.parentNode)
						_content.parentNode.removeChild(_content);					
				}
			}
			_content = null;

			elm.style.display = "";


		}
		Popup.hide = function(bool)
		{

			if(_content.hide)
			{
				_content.hide(function(){
					elm.style.display = "none";
					app.Controller.unlockWindow();
				});
			}
			else
			{
				elm.style.display = "none";
				app.Controller.unlockWindow();
			}
				
		}
		Popup.show = function(bool)
		{
			if(bool && elm.style.display == 'block')
			{
				return;
			}
			bool = typeof bool === "undefined" ? true : bool;
			elm.style.display = bool ? "block" : "none";

			if(_content)
				if(_content.show)
					_content.show(bool);

			if(bool)
			{
				if(typeof _cParams == 'object')
				{
					if(_cParams.history)
					{
						app.Controller.pushPopup(_this,_cParams.history);
					}
					else
					{
						app.Controller.pushPopup(_this);
					}
				}
				else
				{
					app.Controller.pushPopup(_this);
				}
	
				


				app.Controller.lockWindow();
			}
			else
			{
				elm.style.display = "none";
				app.Controller.unlockWindow();
			}
		}

		Popup.getHTML = function()
		{

			

			return elm;
		}


	return Popup;
}});
