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
return function(data,onReply,onDismiss,onClickMore,onProfile,template){
	var _this = {};
	"use strict";

	var Message = app.Mod('msg').Message;
	//private variables
	var _data = data;
	var _onReply = onReply;
	var _onDismiss = onDismiss;
	var _onProfile = onProfile;
	var _template = template;
	var _message = [];

	if(_template)
		_template = Handlebars.compile(_template);

	var elm = cELM('div','notification');
	var controls = cELM('div','controls');
	var lblTitle = cELM('div','title');
	var content = cELM('div','notification_content');

	lblTitle.onclick = function(e)
	{
		onClickMore(data);
	}


	var btDismiss = cELM('a','button btDismiss');
	btDismiss.onclick = function(e)
	{

		elm.parentNode.removeChild(elm);

		_onDismiss(_data.objectId);
	}

	var btMore = cELM('a','button btMore');
	btMore.onclick = function(e)
	{
		onClickMore(data);
	}

	_this.getELM = function()
	{
		return elm;
	}
	_this.update = function(data)
	{
		_data = data;

		for(var j = 0; j < _message.length; j++)
		{
			content.removeELM(_message[j]);
		}

		_message = [];

		for(var i = 0; i < _data.messages.length; i++)
		{
			var d = _data.messages[i];

			var msg = new Message(null,d,_onReply,_onProfile);
			_message.push(msg);
			content.addELM(msg);
		}

	}
	_this.getHTML = function()
	{

		controls.addELM(btDismiss);

		elm.addELM(controls);
		elm.addELM(lblTitle);


		if(_template)
		{
			// console.log('tempate',_data);
			lblTitle.innerHTML = _template(_data);
      // console.log(lblTitle.innerHTML);
		}
		else
		{
			lblTitle.innerHTML = _data.title;
		}

		elm.addELM(content);

		//elm.addELM(btMore);



		if(_data.image)
			elm.style.backgroundImage = "url('"+_data.image+"')";

		for(var i = 0; i < _data.messages.length; i++)
		{
			var d = _data.messages[i];

			var msg = new Message(null,d,_onReply,_onProfile);
			_message.push(msg);
			content.addELM(msg);
		}

		/*
		{
        "ACL": {
          "*": {
            "read": true
          },
          "6zCgTKB0S5": {
            "read": true,
            "write": true
          },
          "role:Admin": {
            "write": true
          }
        },
        "categories": [
          "others"
        ],
        //added per spec
        "name": "Kelly Pruett",
        "people": 4,
        "bookingDates": {
          start: "2016-01-26T23:01:45-08:00",
          end: "2016-02-04T23:01:45-08:00"
        },
        "phone": "+93 232 121 42 32",
        "status": "Booking",
        "rentalAmount": "$8930.00",
        "type": "Airbnb",
        "property": {
          name: "Kent Rd Apartment",
          address: {
            street: "265 Kent Road",
            city: "Pacifica",
            state: "CA",
            zip: "94044"
          }
        },
        "category": "others",
        "createdAt": "2016-01-26T19:17:12.560Z",
        "createdById": "6zCgTKB0S5",
        "description": "Stuff",
        "image": "http://img00.bestlyst.com/bl_0FCE2E75CFBC942BA38A564A136E6595740E8A37",
        "images": [
          "http://img00.bestlyst.com/bl_0FCE2E75CFBC942BA38A564A136E6595740E8A37"
        ],
        "isUserItem": true,
        "links": [],
        "lowerTitle": "testing edit image f",
        "metricsJSON": "{}",
        "modifiedByUserId": "6zCgTKB0S5",
        "objectId": "orqADLqBze",
        "referenceCreateDate": {
          "__type": "Date",
          "iso": "2016-01-26T19:17:12.514Z"
        },
        "referenceId": "RaxnPK5oIY",
        "source": "others",
        "title": "Testing Edit Image F",
        "updatedAt": "2016-01-27T08:00:53.811Z",
      }*/


		return elm;
	}

	_this.getData = function()
	{
		return _data;
	}

	return _this;

};});

