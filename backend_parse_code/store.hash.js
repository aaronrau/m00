
var shortid = require('shortid');

var STORE = function(CONFIG,Cache){
  var STORE_HASH = {};
  var _this = {}

  //AR: Hack for now to handle saving items and lists
  var _ObjectProcessHandler = function(user,list)
  {
      if(user)
      {
      if(list.items)
      {
        var previewItems = [];

        for(var j = 0; j < list.items.length; j++)
        {
          var item = list.items[j];
          if(!item._id)
          {
            item._id = shortid.generate();
            item.createdById = user.id;
           

            if(user)
              list.createdById = user.id;

            //split items out to it's own object and only save the "preview" related data to the list
            STORE_HASH[item._id] = item; 
            previewItems.push({
              _id:item._id,
              title:item.title,
              type:item.type,
              meta:item.meta,
              recentActivity:item.recentActivity
            });

          }
          else
          {
            previewItems.push({
              _id:item._id,
              title:item.title,
              type:item.type,
              meta:item.meta,
              recentActivity:item.recentActivity
            });            
          }

        }

        list.items = previewItems;
      }
    }
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


  _this.handle = function(request,response)
  {

    var action = request.params.action;
    var obj = request.params.object;
    var objs = request.params.objects;
    var key = request.params.key;
    var orderBy = request.params.orderBy;


    if(action == "save")
    {

      if(!obj._id && !key)
      {
        var id = shortid.generate();
        obj._id = id;
        STORE_HASH[id] = obj;

        if(request.user)
          obj.createdById = request.user.id;

        if(_ObjectProcessHandler)
          _ObjectProcessHandler(request.user,obj)


      }
      else
      {
        STORE_HASH[key] = obj;
      }


      response.success(obj);


    }
    else if(action == "get")
    {
      if(_ObjeckPermissionChecker(request.user,STORE_HASH[key]))
        response.success(STORE_HASH[key]);
      else
        response.success(null);
    }
    else if(action == "saveAll")
    {
      
    
      var results = [];

      for(var i = 0; i < objs.length; i++)
      {
        var id = shortid.generate();
      
        if(!objs[i]._id)
        {
          objs[i]._id = id;
          STORE_HASH[id] = objs[i];

          if(request.user)
            objs[i].createdById = request.user.id;
        }
        else
        {
          id = objs[i]._id;
          STORE_HASH[id] = objs[i]; 
        }
      
        if(_ObjectProcessHandler)
        {
          _ObjectProcessHandler(request.user,objs[i]);
        }


        results.push(STORE_HASH[id]);
      }



      response.success(results);
    }
    else if(action == "getAll")
    {
      var results = [];
      for(var key in STORE_HASH)
      {
        if(_ObjeckPermissionChecker(request.user,STORE_HASH[key]))
         results.push(STORE_HASH[key]);
      }

      response.success(results.reverse());
    }


  }


  return _this;
}
