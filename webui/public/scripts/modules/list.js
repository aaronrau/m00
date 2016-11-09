/*
@aaronrau: Example of loading external controller like sortable
*/

/*
@aaronrau: Example of loading external controller like socket io
*/
(function () {
	"use strict";

	var libs = [
		"/socket.io/socket.io.js"
	];
	var ui_components = [
		
	];


	var _DAL = function(){
		return app.Mod("list").DAL;
	}
		

	define(libs.concat(ui_components),function() {
		var args = arguments;
		
		var io = args[0];
		var _socket = null;
		
		var _listHash = {};
		var _popup = null;
		var _popupUserSearch = null;
		var _activeItemPopup = null;
		var _notificationArea = null;

		var _this = {
			Controller:{
				

			}
		}

		//only bind the UI components to this this controller object
		var UIArgs = {}
		for(var i in args)
		{
			if(i == 0)continue;
			UIArgs[i-1] = args[i]
		}
		app.Bind(_this,ui_components,UIArgs);
		return _this;
	});


}());



