(function () {
  "use strict";

	var ui_components = [
		"/scripts/modules/msg.DAL.js",
		"/scripts/modules/msg.DAL.mock.js",
		"/scripts/modules/msg.input.js",
		"/scripts/modules/msg.message.js",
		"/scripts/modules/msg.notification.js",
		"/scripts/modules/msg.conversation.js"
	]
	var _DAL = function(){
		return app.Mod("msg").DAL;
	}

	var _CTRL = function()
	{
		return app.Mod("msg").Controller;	
	}

  	var _module = {
	  Controller:{
		  conversations:{},
		  conversationWidgets:[],
		  notifications:[],
		  notificationCounter:null,
		  notificationWidget:null,
		  checkFrequency:10*1000, // milliseconds
		  checkTimer:null,
		  initObserver:function(){
		    
		    if(_CTRL().notificationWidget)
		      _CTRL().checkTimer = setTimeout(_CTRL().checkNotifications,1000)
		    else
		      _CTRL().checkTimer = setTimeout(_CTRL().checkNotifications,1000)
		  	

		  },
		  stopObserver:function()
		  {
		    
		    clearInterval(_CTRL().checkTimer);
		    _CTRL().checkTimer = null;

		  },
		  startObserver:function()
		  {
		    
		    //_CTRL().checkTimer = setInterval(_CTRL().checkNotifications,_CTRL().checkFrequency);
		   
		    

		  },
		  initLabelCount:function(elmCnt){
		     
			if(elmCnt)
			{
				_CTRL().notificationCounter = elmCnt;
			}


			_DAL().resetNotificationCount(function(success){

			  setStoredKVP("nc_count",0);

			},function(error){

			});


			if(elmCnt)
			{
			  elmCnt.style.display = "none";
			  elmCnt.innerHTML = "";           
			}

	        _CTRL().checkNotifications();

		      
		      
		  },
		  setCounter:function(value)
		  {
		    
		    var curl = window.location.toString();
		    var elmCnt = _CTRL().notificationCounter;
		    if(elmCnt)
		    {
		      if(contains(curl,MSG.rootPath))
		      {
		        //already on the on page
		        return;
		      }

		      setStoredKVP("nc_count",value);

		      if(value <= 0)
		      {
		        elmCnt.style.display = "none";
		      }
		      else
		      {
		        elmCnt.style.display = "block";
		        elmCnt.innerHTML = value;
		      }
		    }

		  },
		  postMessage:function(referenceId,channelId,replyToMessageId,text,success,error)
		  {
		    

				_DAL().post(referenceId,channelId,replyToMessageId,text,
		        function(results){
		            success(results);
		        },
		        function(err){
		            error(err);
		        });

		  },
		  deleteMessage:function(messageId,success,error)
		  {

		     //TBD

		  },
		  flagMessage:function(messageId,success,error)
		  {
		      //TBD
		  },
		  onCheckNotification:function(results)
		  {
		    //shuffle results to correct order and replyTo order
		    for(var i = 0; i < results.length; i++)
		    {
		      var channel = results[i];

		      var orderingHash = {}
		      var sorted = [];

		      for(var j = channel.messages.length -1; j >= 0 ; j--)
		      {
		        var msg = channel.messages[j];
		        if(!channel.messages[j].replyToMessageId)
		        {
		            orderingHash[msg.objectId] = {message:msg,replies:[]};
		        }
		      }

		      for(var j = 0; j < channel.messages.length; j++)
		      {
		        var msg = channel.messages[j];
		        if(channel.messages[j].replyToMessageId)
		        {
		          if(orderingHash[msg.replyToMessageId])
		            orderingHash[msg.replyToMessageId].replies.push(msg);
		        }
		      }

		      for(var n in orderingHash)
		      {
		        sorted.push(orderingHash[n].message);
		         var messages = orderingHash[n].replies.reverse();

		         for(var k =0 ; k < messages.length; k++)
		         {
		          sorted.push(messages[k]);
		         }
		      }     

		      channel.messages = sorted;

		    
		    }

		    _CTRL().notifications = results;
		    

		    if(_CTRL().notificationWidget)
		    {
		      _CTRL().notificationWidget.update(results);
		    }
		    

		  },
		  checkNotifications:function()
		  {
		    if(!_CTRL().checkTimer)
		    {
		      return;
		    }

		    if(_CTRL().notificationWidget)
		    {
		       _DAL().getNotificationContents(function(results){


		        _CTRL().onCheckNotification(results);
		      },function(error){

		      });  
		    }
		    else if(_CTRL().notificationCounter)
		    {
		      var curl = window.location.toString();
		      if(!contains(curl,MSG.rootPath))
		      {
		        //already on the on page?
		         _DAL().getMissedNotificationCount(function(count){

		             _CTRL().setCounter(count);
		          },function(error){

		          });
		      }
		    }

		  },
		  getConversation:function(channelId,success,error)
		  {
		    
		    var conv = _CTRL().conversations[channelId];
		    if (conv)
		    {
		      success(conv); // used cached value
		    }
		    else
		    {
		      _DAL().getConversation(channelId,function(result){

		          _CTRL().conversations[channelId] = result;

		          success(result);

		      },function(error){

		      });
		    }
		  },
		  dismissChannelNotification:function(objectId,success,error)
		  {
		   
		      _DAL().dismissChannelNotification(objectId,
		        function(results){
		            
		            success();
		        },
		        function(error){
		            success();
		        });
		      
		  }
	    }
	  }


	  define(ui_components,function() {
	    app.Bind(_module,ui_components,arguments);
	        return _module;
	  });


	}());

