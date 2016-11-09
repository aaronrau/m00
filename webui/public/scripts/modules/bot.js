/*
@aaronrau: Example of loading external controller like socket io
*/
(function () {
	"use strict";


	var libs = [
		"/socket.io/socket.io.js"
	]
	var ui_components = [
		"/scripts/modules/msg.js"
		,"/scripts/modules/bot.dal.js"
		,"/scripts/modules/bot.input.js"
		,"/scripts/modules/bot.room.js"
	]

	define(libs.concat(ui_components),function() {
		var args = arguments;
		
		var io = args[0];
		var _socket = null;
		
		var _module = {
			Controller:{
				getEvents:function(params,callback)
				{
					callback([])
				},
				connect:function(callback,online)
				{
					//console.log(_socket);

					if(!_socket)
					{
						_socket = io.connect();		
					}
					else 
					{
						
						if(_socket.disconnected)
						{
							//console.log('has been disconnected');

							_socket.removeAllListeners();
							_socket.connect();	

						}
						else if(_socket.connected)
						{
							//console.log('already connected');
							if(callback)
								callback(true);

							return;
						}
							
					}


					_socket.on('reconnect', function (err) {
						//console.log('reconnect');
					});



					_socket.on('connect_error', function (err) {
						//console.log('error');
					});


					_socket.on('connect', function (socket) {
					    
					   	//console.log('new connect')
						var user = app.User.get();
						console.log(user);
						var session = user ? user.id : "default";
						_socket.emit('join',session);	

						var status = {
							session:session,
							socket:_socket.io.engine.id
						};

						//sends a pulse to see who is alive
						_socket.emit('PULSE',status);

					});

					_socket.on('IS_ALIVE',function(data){
						//respone to a list of user that's currently alive/online
						console.log(data);
						if(online)
							online(data);
					})

					_socket.on('CHECK_ALIVE',function(data){
						//respond sends a response to being alive
						var user = app.User.get();
						var session = user ? user.id : "default";
						var data = {
							session:session,
							status:"online",
							socket:_socket.io.engine.id
						}
						_socket.emit('IS_ALIVE',data);	


					})

					if(callback)
						callback(false);
							
				},
				disconnect:function(callback)
				{
					
					var user = app.User.get();
					var session = user ? user.id : "default";
					var data = {
						session:session
					}
				
					_socket.emit('leave',data);	
					_socket.on('disconnect', function(){
						
						console.log('disconnect');

						_socket.removeAllListeners();

						if(callback)
							callback();
					});

					_socket.disconnect();
					
					
				},
				watch:function(action,callback)
				{
					console.log('watch action:'+action);

					_socket.on(action, function (data) {
					    
					    //console.log(data);
					    callback(data);
					    //_socket.emit('my other event', { my: 'data' });
					});

				},
				emit:function(action,data,callback)
				{
					//console.log('emit+'+action);
					//console.log(data);
				
					var user = app.User.get();	
					var session = user ? user.id : "default";

					data.session = session;
					_socket.emit(action,data);
				}


			}
		}

		//only bind the UI components to this this controller object
		var UIArgs = {}
		for(var i in args)
		{
			if(i == 0)continue;
			UIArgs[i-1] = args[i]
		}
		app.Bind(_module,ui_components,UIArgs);
		return _module;
	});


}());
