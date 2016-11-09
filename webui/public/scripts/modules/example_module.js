(function () {
	"use strict";

	var ui_components = [
		"/scripts/modules/example_module.component.js"
	]

	var _module = {
		Controller:{

		}
	}


	define(ui_components,function() {
		app.Bind(_module,ui_components,arguments);
        return _module;
	});
}());

