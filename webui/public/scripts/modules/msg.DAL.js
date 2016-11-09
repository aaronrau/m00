(function () {

  var _this = {
      post:function(referenceId, channelId,replyToMessageId,text,success,error)
      {

        Parse.Cloud.run('postMessage', {referenceId:referenceId,channelId:channelId,replyToId:replyToMessageId,message:{text:text}}, {
          success: function(results) {

              
              success(results);
          },
          error: function(er) {
              error(er);
          }
        });  
        


      },
      getConversation:function(channelId,success,error)
      {
        
      },
      flagNotificationAsRead:function(success,error)
      {

      },
      getNotificationContents:function(success,error)
      {
        Parse.Cloud.run('getRecentChannelNotificationMessages', {}, {
          success: function(results) {

              
              success(results);
          },
          error: function(er) {
              error(er);
          }
        });  

      },
      getMissedNotificationCount:function(success,error)
      {

        Parse.Cloud.run('getNewNotifications', {}, {
          success: function(results) {

              
              success(results.length);
          },
          error: function(er) {
              error(er);
          }
        }); 

      },
      resetNotificationCount:function(success,error)
      {

      },
      dismissChannelNotification:function(channelId,success,error)
      {
        
        Parse.Cloud.run('dismissChannelNotificationMessages', {channelId:channelId}, {
          success: function(results) {
        
            success();
          },
          error: function(er) {
            error(er);
          }
        });

        
      },
      dismissNotification:function(notificationId,success,error)
      {
        success();
      }
   }



  define(function(require, exports, module) {
    //Return the module value
      return _this;
    });

}());

