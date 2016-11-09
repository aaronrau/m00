
/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var
  kue = require('kue'),
  url = require('url'),
  redis = require('redis');


var Cache = function(CONFIG,enableQueue){

	var STORE_HASH = {};


	var redisClient = null;
	var jobQueue = null;
  	var REDIS_URL = null;
  	var redisUrl = null;
  	var REDIS_AUTH = null;

	if(CONFIG.REDIS && !CONFIG.IsForDesigner)
	{
	  var kueOptions = {};

	  if(process.env.REDIS_URL) {
	    REDIS_URL = process.env.REDIS_URL;
	    REDIS_AUTH = CONFIG.REDIS_AUTH;
	    redisUrl = url.parse(process.env.REDIS_URL);
	  }
	  else{
	    REDIS_URL = CONFIG.REDIS;
	    REDIS_AUTH = CONFIG.REDIS_AUTH;
	    redisUrl = url.parse(CONFIG.REDIS);   
	  }

	  kueOptions.redis = {
	      port: parseInt(redisUrl.port),
	      host: redisUrl.hostname
	  };
	  if(redisUrl.auth) {
	      kueOptions.redis.auth = redisUrl.auth.split(':')[1];
	  }

	  redisClient = redis.createClient(REDIS_URL);
	  if(REDIS_AUTH)
	  	redisClient.auth(REDIS_AUTH);

	  if(enableQueue)
	  	jobQueue = kue.createQueue(kueOptions); //AR: require too many redis connections
	}


	var _this = {
		getQueue:function()
		{
			return jobQueue;
		},
		getClient:function()
		{
			return redisClient;
		},
		getURL:function()
		{
			return REDIS_URL;
		},
		getAuth:function()
		{
			return REDIS_AUTH;
		},
		delData:function(key,type){

			//AR: If we delete the cach immediately won't it get recache?
			if(redisClient)
		    {
		    
		      redisClient.del(key+'|store');
		    }
		    else
		    {
		    	delete STORE_HASH[key+'|store'] 
		    }

			


		},
		loadData:function(key,data,expiresAt){
			//just cache the data don't send saving notification
			if(redisClient)
		    {
		      var jData = JSON.stringify(data);

		      redisClient.set(key+'|store',jData);
		      if(!expiresAt)
		      	redisClient.expireat(key+'|store', parseInt((+new Date)/1000) + 86400);
		      else
				redisClient.expireat(key+'|store', expiresAt);

		    }
		    else
		    {
		    	STORE_HASH[key+'|store'] = data;
		    }
		},
		setData:function(key,data,type,expiresAt,callback){
			//cache and save the data


		    if(redisClient)
		    {
				var jData = JSON.stringify(data);
				redisClient.set(key+'|store',jData,callback);
				if(!expiresAt)
					redisClient.expireat(key+'|store', parseInt((+new Date)/1000) + 86400);
				else
					redisClient.expireat(key+'|store', expiresAt);


		    }
		    else
		    {
		    	STORE_HASH[key+'|store'] = data;
		    	if(callback)
		    		callback(null,{})
		    }
		},
		getData:function(key,callback,onNotFound)
		{
		    if(redisClient)
		    {
		      redisClient.get(key+'|store',function(err,result){
		      	if(err)
		      		console.log(err)
		      	
		      	if(result)
		      	{
		        	var data = JSON.parse(result)
		        	callback(data);
		      	}
		      	else
		      	{
		      		if(onNotFound)
		      			onNotFound()
		      		else
		      			callback(null);
		      	}


		      })
		    }
		    else
		    {
		    	callback(STORE_HASH[key+'|store']);
		    }
		},
		getAll:function(callback)
		{
			var results = [];

			if(redisClient)
			{
				var _cnt = 0;
				var _total = 0;
				var _onFinish = function(){
					callback(results);
				}	    	
				redisClient.multi()
				    .keys('*', function (err, replies) {
				        // NOTE: code in this callback is NOT atomic
				        // this only happens after the the .exec call finishes.

				        //console.log("MULTI got " + replies.length + " replies");


				        _total = replies.length;

				        if(_total == 0)
				        	_onFinish();
				        
				        replies.forEach(function (reply, index) {
				            redisClient.get(reply, function(err, data){
                  
				                    if(reply.indexOf('|store') > -1)
				                    	results.push(JSON.parse(data));

				                    _cnt++;
				                    if(_cnt == _total)
				                    	_onFinish();



				            });
				        });

				    })
				    .exec(function (err, replies) {
				    	
				    });


			}
			else{
			  	for(var key in STORE_HASH)
			  	{ 
			  	 results.push(STORE_HASH[key]);
			  	}

			  	callback(results);
	
			}

		}
	}

	return _this;
}


module.exports = Cache;



