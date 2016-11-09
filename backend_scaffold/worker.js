/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
Example of background processing
====================================================
*/

//Argument Processing for misc variables
var PARAMS = require('./utils/params.js')();
var port = PARAMS.PORT;
var URL = PARAMS.URL;

//Application specific configuration
var CONFIG = require('./config/default.js');
if(PARAMS.IsProduction)
  CONFIG = require('./config/production.js');
CONFIG.IsForDesigner = PARAMS.IsForDesigner;

var Cache = new require('./utils/cache.js')(CONFIG,true);


//Load libraries
var 
  vm = require('vm'),
  _ = require('underscore'),
  kue = require('kue'),
  url = require('url'),
  rack = require('hat').rack(),
  MongoClient = require('mongodb').MongoClient,
  redis = require('redis');


var saveTimerHash = {}; 

function toTitleCase(txt)
{
  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    //return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var findDataMongoDB = function(type,query,callback)
{
	if(!type)
	{
	  callback([]);
	  return;
	}

	MongoClient.connect(CONFIG.MONGODB, function(err, db) {

	  var c = db.collection(type);
	  if(c)
	  {
	    c.find(query).toArray(function(err,results){

		if(err)
			console.log (err);

		callback(results);
		db.close();

	    });
	  }
	  else
	  {
	    callback([]);
	  }
	});

}



var loadMongoDB = function(key,type,callback){

	if(!type)
	{
	  callback(null)
	  return;
	}

	var collection = toTitleCase(type);
	if(!collection)
	{
	  callback(null)
	  return;
	}

	MongoClient.connect(CONFIG.MONGODB, function(err, db) {

	  var c = db.collection(collection);
	  if(c)
	  {
	    c.findOne( {_id:key} , function(err, foundItem) {
	        // console.log ( item.username );

	        if(foundItem)
	        {
	          var result = {
	          }

	          for(var prop in foundItem)
	          {
	            result[prop] = foundItem[prop];                
	          }

	          callback(result);

	        }
	        else{
	          callback(null);
	        }
	    });
	  }
	  else
	  {
	    callback(null);
	  }

	 
	});

}
var saveMongoDB = function(key,type,obj,callback){
	  /*
    //sample parse mongodb object
    {
        "_id": "SmHBlV39iK",
        "_rperm": [
            "role:Admin"
        ],
        "_wperm": [
            "role:Admin"
        ],
        "_updated_at": { // AR set before saving to mongodb
            "$date": "2016-07-23T22:29:42.089Z"
        },
        "_created_at": { //AR set be
            "$date": "2016-07-23T05:23:19.728Z"
        }
    }
	  */
	if(!type)
		return false;

	  var collection = String(toTitleCase(type));
	  if(!collection)
	  	return false;

	  MongoClient.connect(CONFIG.MONGODB, function(err, db) {
		console.log("saving object to MongoDB:"+type+" "+obj._id ? obj._id : "")
		var c = db.collection(collection);


	      
		var cObj = {};
		for(var p in obj)
		{
			cObj[p] = obj[p];
		}

		if(cObj["_created_at"])
			cObj["_created_at"] = new Date(cObj["_created_at"]["$date"])
		

		if(cObj["_updated_at"])
			cObj["_updated_at"] = new Date(cObj["_updated_at"]["$date"])


		c.save(
		cObj,
		{
			w: 1
		},
		function(err, mResult) {
		  console.log("saved to monogodb");
		  if(err)
		  	console.log(err);
		  //console.log(mResult);
		  db.close();
		  if(callback)
		  	callback(obj);

		});
			//AR: not sure what's more effecient
		/*
		var c = db.collection(collection);
		  c.findOne( {_id:key} , function(err, foundItem) {
		      // console.log ( item.username );
		      for(var prop in foundItem)
		      {
		        if(result[prop] === undefined)
		        {
		          //result have undefined property?
		        }
		        else
		        {
		          foundItem[prop] = result[prop]; 
		        }
		        
		      }

		    c.updateOne(
		        { "_id" : key },
		        {
		          $set: foundItem
		        }, function(err, mResult) {
		          console.log(mResult);
		          db.close();
		     });

		  });
		*/

	  });
	  

}


var _getObject = function(key,type,callback){
  Cache.getData(key,function(data){

    callback(data);

  },function(){
    //not found
    loadMongoDB(key,type,function(data){
      if(data)
      {
        callback(data);
      }
      else
      {
        console.log("object not found "+key);
        callback(null);
      }

    })

  });
}

var _onDeleteData = function(key,type)
{
	//AR: We Delete data immediately
	console.log("delete data?");

}
var _onSaveData = function(key,type)
{

	var jobQueue = Cache.getQueue();
    if(jobQueue)
	{
	  var job = jobQueue.create('save', {
	      key:key,
	      type:type
	  });

	  job.save();		      	
	}

}

var _emailUsers = function(fromUserId,mentionedUsersHash,userAccessIdsHash,meta,callback)
{
	var userIds = [];
	var text = meta.text;

	var list = meta.list;
	var item = meta.item;

	delete userAccessIdsHash[fromUserId]; //notify yourself?

	var emailsOfMentionedUserWithAccess = [];
	//email mentioned users that have access?
	for(var id in mentionedUsersHash)
	{
		if(userAccessIdsHash[id])
		{
			if(mentionedUsersHash[id].suggestedEmail)
				emailsOfMentionedUserWithAccess.push(mentionedUsersHash[id].suggestedEmail)
		}
	}

	
	//email all users?
	for(var p in userAccessIdsHash)
	{
		if(mentionedUsersHash[id])
			continue

		userIds.push(p)
	}


	console.log('emailing mentioned users:');
	console.log(emailsOfMentionedUserWithAccess);


}

var _onNotify = function(data){
	console.log("notify via email");

	var meta = data.meta;
	var fromUserId = data.user.id;
	var userAccessIdsHash = {};

	//match @mentions
	var pattern =/\B@[.a-z0-9_-]+/gi;
  	var mnames = meta.text ? meta.text.match(pattern) : [];
  	var uNames = [];

  	if(!mnames)
  		mnames = [];

  	for(var i = 0; i < mnames.length; i++)
  	{
  		var u = mnames[i].replace('@','');
  		uNames.push(u)
  	}

  	if(uNames.length > 0)
	{
		findDataMongoDB('_User',{nonUniqueUsername:{$in:uNames}},function(users){

		
			var mentionedUsersHash = {};
			for(var i = 0; i < users.length; i++)
			{
				var u = users[i];
				mentionedUsersHash[u._id] = u;
			}

			if(meta.item._id)
			{
				_getObject(meta.item._id,'item',function(item){

					if(item)
					{
						meta.item = item;
						userAccessIdsHash[item.createdById] = true;
						if(item.access)
							for(var i = 0; i < item.access.length; i++)
							{
								userAccessIdsHash[item.access[i]] = true;
							}
					}

					if(meta.list._id)
					{
						_getObject(meta.list._id,'list',function(list){

							if(list)
							{
								meta.list = list;
								if(list.access)
									for(var i = 0; i < list.access.length; i++)
									{
										userAccessIdsHash[list.access[i]] = true;
									}
							}

							_emailUsers(fromUserId,mentionedUsersHash,userAccessIdsHash,meta);

						});
					}
					else
					{
						_emailUsers(fromUserId,mentionedUsers,userAccessIdsHash,meta);
					}

				});
			}

		});
	}

}

/*
Used to sync timeout timers across multiple servers 
*/
var WORKER_ID = rack();
var rC = redis.createClient(Cache.getURL());
if(Cache.getAuth())
	rc.auth(Cache.getAuth());


rC.psubscribe('changes*');
rC.on("pmessage",function(pattern,channel,jData){

	console.log(channel);
	if(channel == 'changes')
	{

		var data = JSON.parse(jData);
		data.sender = WORKER_ID;
		var key = data.key;
	

		if(key)
		{  	
			Cache.getClient().publish('changes_processed',JSON.stringify(data))
		}


	}
	else if(channel == 'changes_notify')
	{
		console.log('adding notes');

		var data = JSON.parse(jData);

		_onNotify(data);

	}
	else if(channel == 'changes_processed')
	{
		var data = JSON.parse(jData);
		var key = data.key;
		var type = data.type;
		var action = data.action ? data.action : "";
		if(key)
		{

		  	//console.log(WORKER_ID);
		  	//console.log(data);
		  	
			if(saveTimerHash[key+'|'+action])
		  		clearTimeout(saveTimerHash[key+'|'+action]);

		  	if(action == "delete")
		  	{
			  	if(data.sender == WORKER_ID)
			  	{
				  saveTimerHash[key+'|'+action] = setTimeout(function(){
				  	_onDeleteData(key,type);
				  },1000);			  		
			  	}
		  	}
		  	else if(action == "save")
		  	{
			  	if(data.sender == WORKER_ID)
			  	{
				  saveTimerHash[key+'|'+action] = setTimeout(function(){
				  	_onSaveData(key,type);
				  },2000); // AR: This can't be too long			  		
			  	}		  		
		  	}



		
		}		
	}
})


//Process jobs for saving to DB
//AR:each process is a seperate redis client?

var jobs = Cache.getQueue();
jobs.on('job enqueue', function(id, type){
  //console.log( 'Job %s got queued of type %s', id, type );

}).on('job complete', function(id, result){
  kue.Job.get(id, function(err, job){
    if (err) return;
    job.remove(function(err){
      if (err) throw err;
      //console.log('removed completed job #%d', job.id);
    });
  });
});


jobs.process('save', function(job, done) {
  
  var key = job.data.key;
  var type = job.data.type;

	try{
		console.log('saving...');
		//console.log(key);


		var hashParts = key.split('|');
		var objectId = hashParts[0];

		//console.log(objectId);

		Cache.getData(objectId,function(result){
			//console.log(result);
	   
			saveMongoDB(objectId,type,result,function(){
				 done();
			});
			 
		
		});

	}catch(ex){console.log(ex)}
  
  
});
/*
jobs.process('notify', function(job, done) {
  
  var data = job.data.meta;
  var user  = job.data.user;
  console.log(data);

  var key = data.item._id;

  if(data)
  {  	
	Cache.getClient().publish('clearTimeout',JSON.stringify({sender:WORKER_ID,key:key,data:data,user:user,action:"notify"}))
  }

  done();
  
  
});*/
