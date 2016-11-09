//Load libraries
var 
  vm = require('vm'),
  _ = require('underscore'),
  kue = require('kue'),
  url = require('url'),
  rack = require('hat').rack(),
  async = require("async"),
  MongoClient = require('mongodb').MongoClient,
  redis = require('redis');



var STORE = function(CONFIG,Cache){
  var _this = {}

  var shortid = require('shortid');

  function toTitleCase(txt)
  {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      //return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }


  var _onCreateOrUpdate = function(user,obj)
  {
      //adding Parse Compatible attributes
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
          "_updated_at": {
              "$date": "2016-07-23T22:29:42.089Z"
          },
          "_created_at": {
              "$date": "2016-07-23T05:23:19.728Z"
          }
      }
      */

      if(!obj._id)
      {
        obj._id = shortid.generate();
        if(user)
          obj.createdById = user.id;
          
          obj["_rperm"] = []
          obj["_wperm"] = []
          obj["_created_at"] = {
            "$date": new Date().toISOString()
          }  
      }   

      obj["_updated_at"] = {
          "$date": new Date().toISOString()
      }


  }


  var loadMongoDBForUser = function(user,type,callback){

    if(!type || !user)
    {
        callback([]);
       return;
    } 

    var collection = toTitleCase(type);
   
    MongoClient.connect(CONFIG.MONGODB, function(err, db) {
      
      var c = db.collection(collection);
      var MAX_OBJS = 100;
      var results = [];


      var findObjs = function(db, foundCallback) {
         var cursor =c.find({
          "$or": [{
          "createdById": user.id
          }, {
              "access": user.id
          }]

         }).sort( { "_updated_at": -1 } ).limit(MAX_OBJS);
         cursor.each(function(err, doc) {
            
            if(err)
            {
              console.log("Something went wrong when lookging up stuff");
              console.log(err)
            }
              
            if (doc != null) {
              results.push(doc)
            } else {
               foundCallback();
            }

         });
      };

      findObjs(db,function(){
        callback(results);
      })

    });

  }

  var deleteFromMongoDB = function(key,type,callback)
  {

    if(!type)
    {
      callback(null)
      return;
    }

    var collection = toTitleCase(type);

    //AR: TODO do we delete all the items on a list too?

    MongoClient.connect(CONFIG.MONGODB, function(err, db) {
     
      var c = db.collection(collection);
      c.remove( {_id:key} , function(err, foundItem) {
          // console.log ( item.username );

          console.log("delete from mongo")
          if(err)
          {
            console.log(err);
          }

          callback();
        
      });

     
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

    var collection = String(toTitleCase(type));

    MongoClient.connect(CONFIG.MONGODB, function(err, db) {
        console.log("Connected correctly to server.");
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
          {w: 1},
          function(err, mResult) {
            console.log("saved to mongodb");
            if(err)
              console.log(err);

            db.close();

            callback(obj);

        });

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


  var _checkType = function(type,obj)
  {

    if(type == 'list')
    {
      if(obj.items)
      {
        return true;
      }
    } 
    else if(type == 'item')
    {
      if(obj.items)
      {
        return false;
      }
      else if(obj.notes)
      {
        return true;
      }
    }

    return false;
  }


  var _ObjeckPermissionChecker = function(user,obj)
  {



      if(!obj)
        return false;

      if(user)
      { 
        if(obj.createdById)
          if(obj.createdById == user.id)
            return true;

  /*
  //AR:Parse uses _rperm & _wperm wondering if we should adopt the same
      "_id"
      "_rperm": [
          "*",
          "LuUOJd7U2j"
      ],
      "_wperm": [
          "LuUOJd7U2j"
      ],
  */

        if(obj.access)
        {
          for(var i = 0; i < obj.access.length; i++)
          {
            var aId = obj.access[i];
            if(aId == user.id)
            {
               return true;
            } 

          }
        }
      }

      return false;
  }



  var _getObject = function(user,key,type,callback){
      Cache.getData(key,function(data){

        if(_ObjeckPermissionChecker(user,data))
          callback(data);
        else
          callback(null);   

      },function(){
        //not found

        loadMongoDB(key,type,function(data){
   
          if(data)
          {
            if(_ObjeckPermissionChecker(user,data))
            {
              Cache.loadData(key,data);
              callback(data);
            }  
            else
            {
              callback(null);
            }

          }
          else
          {
            console.log("object not found "+key);
            callback(null);
          }

        })

      });
  }

  //AR: Hack for now to handle saving items and lists
  var _ObjectProcessHandler = function(user,obj,type,callback)
  {


      var checkCache = function(params,complete){

          var key = params.data._id;
          var access = params.access;
          var isNew = params.isNew;

          if(isNew)
          {
            //AR: this should never happen
            console.log('new item?')
            complete(null,{});
            /*
            Cache.setData(item._id,item,'item',null,function(err,reply){

              if(err)
                console.log(err);

              complete(null,{});

            });
            */
          }
          else
          {

            _getObject(user,key,"item",function(data){

              if(data)
              {
                if(!data.access)
                {
                  data.access = access;
                  Cache.setData(key,data,'item');                
                }
                else if(JSON.stringify(data.access) != JSON.stringify(access))
                {
                  data.access = access;
                  Cache.setData(key,data,'item');
                }
              }

              complete(null,data);
            })
          }
      }


      if(user)
      {

        if(!_ObjeckPermissionChecker(user,obj))
          return;

        if(obj.items)
        {

          var previewItems = [];
          var itemsUpdate = [];
          for(var j = 0; j < obj.items.length; j++)
          {
            var item = obj.items[j];

            var isNew = false;

            if(!item._id)
              isNew = true;

            _onCreateOrUpdate(user,item);

            //split items out to it's own object and only save the "preview" related data to the list
            if(isNew)
            {
              item.access = obj.access;
              itemsUpdate.push({
                isNew:true,
                key:item._id,
                data:item,
                access:obj.access
              })
            }
            else
            {

              if(obj.access)
                if(obj.access.length > 0)
                  itemsUpdate.push({
                    isNew:false,
                    key:item._id,
                    data:item,
                    access:obj.access
                  })
            }

            previewItems.push({
              _id:item._id,
              title:item.title,
              type:item.type,
              meta:item.meta,
              recentActivity:item.recentActivity
            });

          }

          obj.items = previewItems;

          if(itemsUpdate.length > 0)
          {
            async.mapSeries(itemsUpdate, checkCache, function(err,results){
                callback(obj,type);
            });          
          }
          else
          {
            callback(obj,type);
          }

        }
        else
        {
          callback(obj,type);

        }
    }
  }

  _this.handle = function(request, response) {

   
    var action = request.params.action;
    var obj = request.params.object;
    var objs = request.params.objects;
    var key = request.params.key;
    var orderBy = request.params.orderBy;
    var type = request.params.type;


    if(action == "save")
    {

      _onCreateOrUpdate(request.user,obj);

      _ObjectProcessHandler(request.user,obj,type,function(result){

        // AR: Caching saves the data to the db if the worker process is enabled
        Cache.setData(result._id,result,type,function(err,reply){

          //AR: Publish saved changes to other users
          var pub = Cache.getClient();
          var pubObj = {
            user:null,
            data:result,
            type:type,
            key:result._id,
            action:"save"
          }

          if(request.user)
            pubObj.user = {id:request.user.id};


          pub.publish('changes',JSON.stringify(pubObj));
          response.success(result);

        }); 
       

      })

      
    }
    else if(action == "del")
    {
      
      var pub = Cache.getClient();

      var pubObj = {
        user:null,
        data:{
          key:key
        },
        type:type,
        key:key,
        action:"delete"
      }

      if(request.user)
        pubObj.user = {id:request.user.id};

      pub.publish('changes',JSON.stringify(pubObj));

      loadMongoDB(key,type,function(data){

       if(_ObjeckPermissionChecker(request.user,data))
       {

        deleteFromMongoDB(key,type,function(){

          Cache.delData(key,type);

          response.success(null);
        })


       }
       else
       {
        console.log("invalid permission delete")
        response.success(null);
       }


      });

      
     
    }
    else if(action == "get")
    {
      _getObject(request.user,key,type,function(result){

        response.success(result);
      });


    }
    else if(action == "saveAll")
    {
      
    
      var results = [];

      for(var i = 0; i < objs.length; i++)
      {
        var id = shortid.generate();
      
       _onCreateOrUpdate(request.user,objs[i]);
     
       _ObjectProcessHandler(request.user,objs[i],type);


        results.push(objs[i]);
      }


      response.success(results);
    }
    else if(action == "getAll")
    {
      var tp = type;

      var checkCache = function(params,complete){

          var key = params.data._id;

          Cache.getData(key,function(data){

            complete(null,data);

          },function(){
            //cached the value
            Cache.loadData(key,params.data);

            complete(null,params.data);

          })
      }


      //AR: TODO only get the ones that the user has access to then store those in redis?
      loadMongoDBForUser(request.user,type,function(results){

        var requests = []

        for(var i = 0; i < results.length; i++)
        {
          var r = results[i];
          requests.push({
            data:results[i]
          })
        }

        async.mapSeries(requests, checkCache, function(err,results){
            response.success(results);
        });


      })
      /*
      //Get directly from redis cach? Good for testing but not prod code?
      Cache.getAll(function(values){

       
        var results = [];
        for(var i in values)
        {
          var v = values[i];
          if(_ObjeckPermissionChecker(request.user,v))

          if(type)
          if(_checkType(type,v))
            results.push(v);

        }

        //response.success(results.reverse()); // AR: Redis results seems to be reversed already
        response.success(results);

      })*/
      

    }

  }

  return _this;
};

module.exports = STORE;

