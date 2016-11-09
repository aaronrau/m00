
var Buffer = require('buffer').Buffer
    ,_ = require('underscore')
    ,rack = require('hat').rack();

Parse.Cloud.define("listSources", function(request, response) {



  var cleanedResults = [];

  if(request.user)
  {

    var query = new Parse.Query("Source");
    var queryOAuth = new Parse.Query("OAuth");
    queryOAuth.equalTo('users',request.user)


    Parse.Promise.as().then(function(){

        return query.find({ useMasterKey: true });

     }).then(function(sources){

      

      for(var i = 0; i < sources.length; i++)
      {
        cleanedResults.push({
          auth_ref:null,
          type:sources[i].get("type"),
          displayName:sources[i].get("displayName"),
          displayDescription:sources[i].get("displayDescription"),
          icons:sources[i].get("icons"),
          OAuth:null
        });
      }


      return queryOAuth.find({ useMasterKey: true });

     }).then(function(OAuthValues){

      
      for(var i = 0 ; i < OAuthValues.length; i++)
      {
        for(var j = 0; j < cleanedResults.length; j++)
        {
            var source = cleanedResults[j];
            if(source.type == OAuthValues[i].get("source"))
            {
              cleanedResults[j].auth_ref = OAuthValues[i].id;
              cleanedResults[j].OAuth = OAuthValues[i].get("OAuthData");
            }


        }
      }

      return response.success(cleanedResults);

     })
  }

});



Parse.Cloud.define("oauth", function(request, response) {
  if(request.master)
  {
    
    console.log('parse cloud code oauth');

    var OAuth = Parse.Object.extend("OAuth");

   
    Parse.Cloud.useMasterKey();

    var source = request.params.source;
    var sourceUserId = request.params.sourceUserId;
    var data = request.params.OAuthData;
    var signupType = request.params.signupType;
    
    var query = new Parse.Query("OAuth");
    query.equalTo('sourceUserId', sourceUserId);
    query.equalTo('source', source);
    query.equalTo('signupType', 'oauth');
    query.limit(10);

    var isNew = false;
 
    Parse.Promise.as().then(function(){

        return query.find({ useMasterKey: true });

     }).then(function(auths){
       
      console.log('existing auths:'+auths.length);

      if(auths.length == 0)
      {
          isNew = true;
          
           console.log('creating new user');          

          var user = new Parse.User();
          // Generate a random username and password.
          var username = new Buffer(24);
          var password = new Buffer(24);
          _.times(24, function(i) {
            username.set(i, _.random(0, 255));
            password.set(i, _.random(0, 255));
          });
          user.set("username", username.toString('base64'));
          user.set("password", password.toString('base64'));

          var newAuthData = JSON.parse(data);

          if(newAuthData.user)
          {
            user.set('fullname',newAuthData.user.sourceFullname);
            user.set('nonUniqueUsername',newAuthData.user.sourceUserName);
            user.set('profileURL',newAuthData.user.sourceUserProfilePic);

            if(newAuthData.user.sourceUserEmail)
            {
              user.set('suggestedEmail',newAuthData.user.sourceUserEmail);
              var s = newAuthData.user.sourceUserEmail.split('@')
              user.set('suggestedEmailDomain',s[1]);
            }
            
          }          

        
          // Sign up the new User
          return user.signUp().then(function(savedUser) {

              var newUser = savedUser;

              var newOAuthEntry = new OAuth();
              newOAuthEntry.set('source',source);
              newOAuthEntry.set('sourceUserId',sourceUserId);
              newOAuthEntry.set('OAuthData',data);
              newOAuthEntry.set('signupType','oauth');
              var relation = newOAuthEntry.relation("users");
              relation.add(newUser);

              var newACL = new Parse.ACL(request.user);
              newACL.setRoleReadAccess("Admin", true);
              newACL.setRoleWriteAccess("Admin", true);
              newOAuthEntry.setACL(newACL);

              console.log('creating new user');

              return newOAuthEntry.save().then(function(){

               
                return Parse.Promise.as(newUser.getSessionToken());
              });

          });
      }
      else
      {
          console.log('found auth');

          var oauthEntry = auths[0];
          //This is need to only update properties that change; for example google sends different properties

          var oldAuthData = JSON.parse(oauthEntry.get('OAuthData'));

          var newAuthData = JSON.parse(data);

          var newObj = {};

          for(var oldProp in oldAuthData)
          {
              newObj[oldProp] = oldAuthData[oldProp];
          }
 
          for(var newProp in newAuthData)
          {
             
              var type = typeof newAuthData[newProp];
              if( type == "object")
              {
                  for(var newProp2 in newAuthData[newProp])
                  {
                      if(!newObj[newProp])
                      {
                          newObj[newProp] = newAuthData[newProp];
                      }
                      newObj[newProp][newProp2] = newAuthData[newProp][newProp2];  
                  }
              }
              else if (type == "number" || type == "string")
              {
                  newObj[newProp] = newAuthData[newProp];
              }
            
          }


          oauthEntry.set('OAuthData',JSON.stringify(newObj));

          return oauthEntry.save().then(function(oauthEntry){

            

            var relation = oauthEntry.relation('users');

            return relation.query().first({useMasterKey: true }).then(function(savedUser) {

              //AR why isn't this working?
              //Parse.Cloud.useMasterKey();
              //console.log(savedUser.getSessionToken()); 

              return Parse.Promise.as(savedUser);

            }).then(function(user){

              var query = new Parse.Query("_Session");

              console.log('founder user id:'+user.id);
              query.equalTo('user', user);
              query.descending("expiresAt");
              return query.first({ useMasterKey: true }).then(function(session){
    
                if(!session)
                {
                  console.log('create session token');

                  var Session = Parse.Object.extend("_Session");
                  var newSession = new Session()

                  var token = 'r:' + rack();

                  var expiresAt = new Date();
                  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

                  /*
                  var sessionData = {
                    sessionToken: token,
                    user: {
                      __type: 'Pointer',
                      className: '_User',
                      objectId: user.objectId
                    },
                    createdWith: {
                      'action': 'login',
                      'authProvider': 'password'
                    },
                    restricted: false,
                    expiresAt: Parse._encode(expiresAt)
                  };*/

                  newSession.set('sessionToken',token);
                  newSession.set('user',user);
                  newSession.set('restricted',false);
                  newSession.set('expiresAt',expiresAt);

          
                  return newSession.save().then(function(result){

                    console.log('saved new token');

                    return Parse.Promise.as(token); 

                  })

                }
                else
                {
                  var token = session.getSessionToken();
                  console.log('found session token');
                  
                  return Parse.Promise.as(token);                  
                }


              });



            });
            
          });

      }



     }).then(function(token){

        
      console.log('returning token');

        var t = {
          sessionToken:token
        }
        return response.success(t);

     });
  }
  else
  {
     return response.success();

  }

});




Parse.Cloud.define("oauthLink", function(request, response) {

    
  var OAuth = Parse.Object.extend("OAuth");

  var cUser = request.user;
  
  if(cUser)
  {
    Parse.Cloud.useMasterKey();

    var source = request.params.source;
    var sourceUserId = request.params.sourceUserId;
    var data = request.params.OAuthData;

    var query = new Parse.Query("OAuth");
    query.equalTo('sourceUserId', sourceUserId);
    query.equalTo('source', source);
    query.equalTo('users', cUser);
    
    //query.include("users"); // ar this doesn't work in cloud code? It only works with
    query.limit(10);

    var isNew = false;

    Parse.Promise.as().then(function(){

        return query.find({ useMasterKey: true });

     }).then(function(auths){
       
      if(auths.length == 0)
      {
          var newOAuthEntry = new OAuth();
          newOAuthEntry.set('source',source);
          newOAuthEntry.set('sourceUserId',sourceUserId);
          newOAuthEntry.set('OAuthData',data);

          var newACL = new Parse.ACL(request.user);
          newACL.setReadAccess(request.user.id,true);
 
          var newACL = new Parse.ACL(request.user);
          newACL.setRoleReadAccess("Admin", true);
          newACL.setRoleWriteAccess("Admin", true);
          newOAuthEntry.setACL(newACL);

          var relation = newOAuthEntry.relation("users");
          relation.add(cUser);

          return newOAuthEntry.save().then(function(){

           
            return Parse.Promise.as('new');
          });
      }
      else
      {
          
          var oauthEntry = auths[0];

          //This is need to only update properties that change; for example google sends different properties

          var oldAuthData = JSON.parse(oauthEntry.get('OAuthData'));

          var newAuthData = JSON.parse(data);

          var newObj = {};

          for(var oldProp in oldAuthData)
          {
              newObj[oldProp] = oldAuthData[oldProp];
          }
 
          for(var newProp in newAuthData)
          {
             
              var type = typeof newAuthData[newProp];
              if( type == "object")
              {
                  for(var newProp2 in newAuthData[newProp])
                  {
                      if(!newObj[newProp])
                      {
                          newObj[newProp] = newAuthData[newProp];
                      }
                      newObj[newProp][newProp2] = newAuthData[newProp][newProp2];  
                  }
              }
              else if (type == "number" || type == "string")
              {
                  newObj[newProp] = newAuthData[newProp];
              }
            
          }

          oauthEntry.set('OAuthData',JSON.stringify(newObj));
          
          return oauthEntry.save().then(function(oauthEntry){
            return Parse.Promise.as('updated');
          });

      }



     }).then(function(status){

        
        return response.success(status);

     });
   
  }
  else
  {
    return response.success("error");
  }



});

