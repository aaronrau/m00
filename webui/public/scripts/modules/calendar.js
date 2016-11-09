(function () {
	"use strict";

	var ui_components = [
	]


	var _module = {
		Controller:{
			getEvents:function(params,callback)
			{
				callback([])
			}
		}
	}


	define(ui_components,function() {
		LoadCSS('/scripts/libs/fullcalendar.min.css');

        return _module;
	});


}());


