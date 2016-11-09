/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/*
@aaronrau: Example of loading external js library that dependants on jquery.js and moment.js directly in the section
1. Probably not the best way to structure code but if you need something quick to show on the UI this is the way to go.
*/
(function () {
	"use strict";

  //need for fullcalendar.js 
  require.config({
      paths: {
          "moment": "/scripts/libs/moment.min"
      }
  });
	//module definition.
	define(["/scripts/libs/jquery-1.9.1.min.js",
    "moment",
    "/scripts/libs/handlebars.min.js",
    '/scripts/libs/fullcalendar.js'
   ],function(jQuery,moment,Handlebars){



  //private variables
  var _SECTION = 'calendar';
  var _container = null; //parent container for the section
  var _hasRender = false; //flag used to determine if the section has already been rendered on the screen;

  var _ctrl = app.Mod('calendar').Controller;

  var elm = cELM('div',_SECTION),
    elmCal = cELM('div','calendar'),
    loadingSpinner = cELM('div','background_text');

    loadingSpinner.innerHTML = 'Loading...';

  //loads events to renders calendar
  var _fetchEvents = function() {
    elm.innerHTML = "";
    elm.addELM(loadingSpinner);
    elm.addELM(elmCal);


    _ctrl.getEvents({}, function(results){
      elm.removeChild(loadingSpinner);
      var eventsArr = [];
      console.log('results',results);
      for(var i = 0; i < results.length; i++) {
        eventsArr.push({
          title: results[i].referenceObject.guest.fullname +' '+results[i].referenceObject.property.address.street,
          start: results[i].referenceObject.bookingDates.start,
          end: results[i].referenceObject.bookingDates.end,
          allDay: true,
          //TODO: add more options
          color: results[i].referenceObject.type ? '#3b91ad' : '#7FA4DC'
        });
      }


     // console.log('events',eventsArr);
      $(elmCal).fullCalendar({
        //TODO: add functionality to click event
        eventClick: function(event){console.log('clicked! ',event.title)},
        header: {
          left: '',
          center: 'title',
          right: 'prev,next'
        }
      });
      //have to do this way to update events on render otherwise old events show
      $(elmCal).fullCalendar('removeEvents');
      $(elmCal).fullCalendar('addEventSource', eventsArr);
      $(elmCal).fullCalendar('refetchEvents');

    });



  };

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


        _fetchEvents();

        if(_hasRender)
        {
          return;
        }



        //this is loaded via modules/calendar.js

        // AR: Issues with updating calendar
        // $(elmCal).fullCalendar({
          // put your options and callbacks here
        // })

        _hasRender = true;
      },
      views:{

      }
   }


  return _this;


    });
}());
