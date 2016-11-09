(function () {

	var _SECTION = 'dashboard';
	var _container = null; //parent container for the section
	var _hasRender = false; //flad used to determine if the section has already been rendered on the screen;

  // console.log('dahs', app.Mod('dashboard'));
  var _ctrl = app.Mod('dashboard').Controller;


 	var elm = cELM('div',_SECTION),
 	loadingSpinner = cELM('div','background_text');
  loadingSpinner.innerHTML = 'Loading...';

  var _fetchBookings = function() {
  	elm.innerHTML = "";

  	// elm.addELM(loadingSpinner);

  	_ctrl.getBookings({},function(results){
  		// elm.removeChild(loadingSpinner);

  		// console.log('results', results)

      //render current booking
      var Booking = app.Mod('dashboard').Bookings;
      var aBooking = new Booking(results);
      elm.addELM(aBooking);

  	})
  }


	var _this = {
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

			_fetchBookings();

	    	if(_hasRender)
	    	{
	    		return;
	    	}



	    	_hasRender = true;
	    },
	    views:{

	    }
	 }



	//Main module definition.
	define(_this);
}());
