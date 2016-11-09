
var Buffer = require('buffer').Buffer
    ,_ = require('underscore')
    ,oaut = require('./oauth')
    ,WebCapture = require('./convertURL2png.js')
    ,rack = require('hat').rack();


//Argument Processing for misc variables
var PARAMS = require('../backend_scaffold/utils/params.js')();
var port = PARAMS.PORT;
var URL = PARAMS.URL;

//Argument Processing for misc variables
var CONFIG = require('../backend_scaffold/config/default.js');
if(PARAMS.IsProduction)
  CONFIG = require('../backend_scaffold/config/production.js');
CONFIG.IsForDesigner = PARAMS.IsForDesigner;

var Cache = new require('../backend_scaffold/utils/cache.js')(CONFIG);

var Store = new require('./store.redis+mongodb')(CONFIG,Cache)


Parse.Cloud.afterSave(Parse.User, function(request) {
  // Only perform this action if this is a new user.
  if (!request.object.existed()) {
    Parse.Cloud.useMasterKey();

    var query = new Parse.Query(Parse.Role);
    query.equalTo("name", "Users");
    query.first ( {
      success: function(object) {
        object.relation("users").add(request.user);
        object.save();
        response.success("The user has been authorized.");
      },
      error: function(error) {
        response.error("user authorization failed");
      }
    });
    }
});


var _checkRole = function(user,role)
{
  Parse.Cloud.useMasterKey();

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', role);
  query.equalTo("users",user);
  return query.first().then(function(role){  

    if(role && user)
    {
      return Parse.Promise.as({role:role,isFound:true});
    }
    else
    {

      return Parse.Promise.as({role:null,isFound:false});
    }

  })
}



Parse.Cloud.define("notify", function(request, response) {

  console.log(request.user);
  console.log(request.params.meta);
  
  if(Cache.getURL())
  {
    if(request.user)
    {
      var pubObj = {
        user:null,
        meta:request.params.meta
      }
      pubObj.user = {id:request.user.id};
      Cache.getClient().publish('changes_notify',JSON.stringify(pubObj))
    }
    
    response.success({});

  }
  else
  {
    response.success({});   
  }

  //AR: this is very specific now to list need to move this out
  //only notify users that have access to the list and item?

 
  
});

Parse.Cloud.define("inviteUsers", function(request, response) {

  var result = {};
 
  var invUsers = request.params.inviteUsers;
  var uninvUsers = request.params.uninviteUsers;
  var object = request.params.object;
  var rType = request.params.type;

  if(!invUsers)
    invUsers = {};
  if(!uninvUsers)
    uninvUsers = {};
  

  if(request.user)
  {
    var user = request.user;
    //check and add to role;
    Parse.Cloud.useMasterKey();

    var missingUsers = {};

    var newAccess = [];

    if(object)
      if(object.access)
        for(var i = 0; i < object.access.length; i++)
        {
          var uid = object.access[i];
          
          if(!invUsers[uid] && !uninvUsers[uid])
            missingUsers[uid] = true;
        }

    for(var id in invUsers)
    {
      newAccess.push(id);
    }

    for(var id in missingUsers)
    {
      newAccess.push(id);
    }

    result.access = newAccess;

    return response.success(result);
  }
  else
  {
    return response.success(null); 
  }

});

Parse.Cloud.define("findUsers", function(request, response) {

  
  var name = request.params.name;
  if(name)
    name = name.toLowerCase();

  var obj = request.params.object;
  var accessHash = {}
  if(obj)
  {
    accessHash[obj.createdById] = true;

    if(obj.access)
      for(var i = 0; i < obj.access.length; i++)
      {
        var uid = obj.access[i];
        accessHash[uid] = true;
      }
  }


  var isExactMatch = request.params.isExactMatch;
  var results = [];


  if(request.user)
  {
    var user = request.user;
    //check and add to role;
    Parse.Cloud.useMasterKey();

    var query = new Parse.Query("User");

    if(name)
    {
      if(isExactMatch)
        query.equalTo('nonUniqueUsername',name);
      else
        query.startsWith('nonUniqueUsername',name);
    }
    
    var udomain = user.get("suggestedEmailDomain");

    //AR
    //probably better to add some sort restriction here in the future
    query.equalTo('suggestedEmailDomain',udomain);

    return query.find().then(function(names){  

    

      for(var i = 0; i < names.length;i++)
      {
        var u = names[i];



        results.push({
          id:u.id,
          isSelected:accessHash[u.id] ? true : false,
          username:u.get('nonUniqueUsername'),
          fullname:u.get('fullname'),
          profileURL:u.get('profileURL'),
          title:u.get('title')   
        });
      }

    }).then(function(){

    
      return response.success(results); 

    })


  }
  else
  {
    return response.success([]); 
  }
});

Parse.Cloud.define("checkRole", function(request, response) {
  //check and add to role;
  Parse.Cloud.useMasterKey();

  var _role = null;
  var _user = request.user;

  var _roleType = 'Users'
  
  //console.log(_user.get('email'));  
  
  _roleType = 'Users'

  return _checkRole(_user,_roleType).then(function(chk){

    if(!chk.isFound)
    {
      var queryRole = new Parse.Query(Parse.Role);
      queryRole.equalTo('name', _roleType);
      return queryRole.first();

    }
    else
    {
      return Parse.Promise.as(false);
    }

  }).then(function(roleToAdd){
    if(roleToAdd)
    {
      roleToAdd.relation("users").add(_user);
      return roleToAdd.save();

    }
    else
    {
      return Parse.Promise.as(false);
    }

  }).then(function(isJustAdded){

    if(isJustAdded)
    {
      return Parse.Promise.as(null);
    }
    else
    {
      return Parse.Promise.as(null);
    }
   

  }).then(function(){

    response.success({});

  },function(err){
    console.log(err);
  });
});


Parse.Cloud.define("store", function(request, response) {

  Store.handle(request,response);

});
