app.Ext(app,{DAL:{
//--DAL UTIL
    getObjectFromParse:function(parseObj)
    {
        var obj = parseObj.attributes;
        obj.objectId = parseObj.id;
        return(obj);
    },   
    setParseObject:function(parseObj,obj)
    {
        for(var k in obj)
        {
            parseObj.set(k,obj[k]);
        }
    },
    loginSocial:function(type)
    {

    },
    login:function(email,password,success,error)
    {
      if(email)
        email = email.toLowerCase();

      Parse.User.logIn(email, password, {
        success: function(user) {
          // Do stuff after successful login.


          Parse.Cloud.run('checkRole', {}, {
          success: function(result) {
            success(user);
          },
          error: function(er) {
            error(er);
          }
          });


        },
        error: function(user, er) {
          // The login failed. Check error to see why.
          error(er);
        }
      });
    },
    logout:function()
    {
      setCookie('username', "", 325);
      setCookie('userId', "", 325);
      setCookie('session_token', "", 325);

      Parse.User.logOut();
    },
    signUp:function(email,password,success,error)
    {
        var pw = password;
        var em = email;
        if(em)
          em = em.toLowerCase();


        var user = new Parse.User();
        user.set("username", em);
        user.set("password", pw);
        user.set("email", em);

        var ep = em.split('@');
        user.set("fullname",ep[0]);

        console.log(ep[0]);
         
        user.signUp(null, {
          success: function(user) {
            // Hooray! Let them use the app now.

            Parse.Cloud.run('checkRole', {}, {
            success: function(result) {
              success(user);
            },
            error: function(er) {
              error(er);
            }
            });

            

          },
          error: function(user, er) {
           
            error(er);
          }
        });
    }    

}});
