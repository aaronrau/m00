/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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

var disableQueue = true;
console.log(port);
//Load libraries
var 
  vm = require('vm'),
  express = require('express'),
  exphbs  = require('express-handlebars'),
  bodyParser = require('body-parser'),
  request = require('request'),
  _ = require('underscore'),
  redis = require('redis'),
  adapter = require('socket.io-redis'),
  PURL = require('url'),
  ParseServer = require('parse-server').ParseServer;



var _PARSE_KEYS = CONFIG.PARSE_KEYS;
var MONGODB_CONNECTION_STRING = CONFIG.MONGODB;

var PARSE_KEYS_FOR_UI = {
  APP_ID:_PARSE_KEYS.APP_ID,
  REST_KY:_PARSE_KEYS.APP_ID,
  JAVA_SCRIPT:_PARSE_KEYS.JAVA_SCRIPT
}

var SendGridAdapter = require('parse-server-sendgrid-adapter');
var Bot = new require('./bot.js');
var app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    parseServer = new ParseServer({
      VERBOSE:1,
      databaseURI: MONGODB_CONNECTION_STRING,
      cloud: 'backend_parse_code/main.js', // Provide an absolute path
      appId: _PARSE_KEYS.APP_ID,
      masterKey: _PARSE_KEYS.MASTER_KEY, //Add your master key here. Keep it secret!
      javascriptKey:_PARSE_KEYS.JAVA_SCRIPT,
      restKey:_PARSE_KEYS.REST_API,
      fileKey: 'optionalFileKey',
      serverURL:'/parse',
      /*serverURL: 'http://localhost' + port ? port : + '/parse', // Don't forget to change to https if needed,*/
      emailAdapter: SendGridAdapter({
        apiKey: 'sendgridApiKey',
        fromAddress: 'fromEmailAddress'
      })
    });


/*
===================================================
Socket IO Related
===================================================
AR: TODO migrate to seperate library
*/

var REDIS_URL = null;
var redisUrl = null;
var REDIS_AUTH = null;

if(CONFIG.REDIS && !CONFIG.IsForDesigner)
{
  
  if(process.env.REDIS_URL) {
    REDIS_URL = process.env.REDIS_URL;
    REDIS_AUTH = CONFIG.REDIS_AUTH;
  }
  else{
    REDIS_URL = CONFIG.REDIS;
    REDIS_AUTH = CONFIG.REDIS_AUTH;
 
  }
}


if(REDIS_URL)
{
  var redisPub = null;
  var redisSub = null;

  var p = PURL.parse(REDIS_URL);
 
  var rC = require('redis').createClient;


  if(CONFIG.REDIS_AUTH)
  {
    redisPub = rC(parseInt(p.port), p.hostname, { auth_pass: REDIS_AUTH});
    redisSub = rC(parseInt(p.port), p.hostname, { return_buffers: true, auth_pass:REDIS_AUTH});
  }
  else
  {
    redisPub = rC(parseInt(p.port), p.hostname);
    redisSub = rC(parseInt(p.port), p.hostname,{ return_buffers: true});
  }

  io.adapter(adapter({ pubClient: redisPub, subClient: redisSub }));
}

  
io.on('connection', function (socket) {
  
  console.log('socket connection:'+socket.client.id);
 
  socket.on('join', function (session) {
    //console.log('join room:'+session);
    socket.join(session); // We are using room of socket io
    //io.to(session).emit('message',{text:'server:someone joined'});

  });

  socket.on('leave', function(data) {  
   
    if(data.session)
    {
      var session = data.session;

      //console.log('leave room :'+session);

      //io.to(session).emit('message',{text:"server:someone left"});
      socket.leave(session);
      
    }
  })

  socket.on('message', function (data) {
    //console.log('received message');
    //console.log(data);
    
    if(data.session)
    {
      var session = data.session;
      delete data.session;
      
      if(data.text)
      {
        if(data.text.indexOf('check_alive') > -1)
          io.to(session).emit('CHECK_ALIVE',{})
        else
        {
          io.to(session).emit('message',data);
          
          io.to(session).emit('message',{user:{id:"bot"},status:"typing",text:""});

          setTimeout(function(){
             io.to(session).emit('message',{user:{id:"bot"},text:"what's up"});
          },500);
         
        }
      }

    }
  });

  //AR:Bot specific
  socket.on('botting', function (data) {
    //console.log('received message');
    //console.log(data);
    
    if(data.session)
    {
      var session = data.session;
      delete data.session;
      
      if(data.text)
      {
        if(data.text.indexOf('check_alive') > -1)
          io.to(session).emit('CHECK_ALIVE',{})
        else
        {
          io.to(session).emit('botting',data);
          
          io.to(session).emit('botting',{user:{id:"bot"},status:"typing",text:""});

          setTimeout(function(){



            Bot.conversationpatterns(data.text,function(response){
              io.to(session).emit('botting',{user:{id:"bot"},text:response});

            });
            
          },500);
         
        }
      }


    }
  });

  socket.on('PULSE', function (data) {
    //console.log('received message');
    //console.log(data);
    
    if(data.session)
    {
      var session = data.session;
      delete data.session;
      io.to(session).emit('CHECK_ALIVE',{})
    }
  });

  socket.on('IS_ALIVE', function (data) {
    //console.log('received message');
    //console.log(data);
    
    if(data.session)
    {
      var session = data.session;
      delete data.session;
      io.to(session).emit('IS_ALIVE',data);      
    }
  });


  socket.on('disconnect', function (data) {
    //console.log("someone disconnect");
  });

});


//subscribe to changes saved by other users
if(REDIS_URL)
{
  var redisSub = null;

  var p = PURL.parse(REDIS_URL);

  var rC = require('redis').createClient;


  if(REDIS_AUTH)
  {
    redisSub = rC(parseInt(p.port), p.hostname, { return_buffers: true, auth_pass:REDIS_AUTH});
  }
  else
  {
    redisSub = rC(parseInt(p.port), p.hostname,{ return_buffers: true});
  }

  redisSub.subscribe('changes');
  redisSub.on("message",function(channel,jsonObj){

      console.log(channel.toString());

      try{
        var p = JSON.parse(jsonObj)
        var d = p.data;
        var a = p.action;

        console.log(a);

        var usersToNotify = [];

        if(p.user)
        {
          //AR: would it be easier to just notify everyone?

          if(d.createdById && p.user)
          if(d.createdById != p.user.id)
            usersToNotify.push(d.createdById) //creator should get notify if it's not the user that initialed the save
          
          if(d.access)
          {
            //anyone that has access should get notify except the user that initialted the save
            for(var i = 0; i < d.access.length; i++)
            {
              var uid = d.access[i];
              if(p.user)
                if(p.user.id == uid) 
                  continue;

              usersToNotify.push(uid);
            }
    
          }
        }

        console.log("user that send update to");
        console.log(usersToNotify);
      }
      catch(ex){
        console.log("Unable to parse REDIS subscription message")
        console.log(ex);
      }    
    



  });
}


/*
===================================================
//FREE Heroku SSL
===================================================
AR: TODO move to own modules
References:
https://blog.heroku.com/announcing_heroku_free_ssl_beta_and_flexible_dyno_hours
https://community.letsencrypt.org/t/lets-encrypt-and-heroku-solved/4272/14

Heroku Commands:
$ heroku labs:enable http-sni --app <your app>
$ heroku plugins:install heroku-certs
$ heroku _certs:add cert.pem privkey.pem --app <your app>
# Use the --type sni flag if you have an SSL Endpoint add-on on your application already.

SSL Certication Server Commands:
$ ./letsencrypt-auto certonly --manual -d <your-domain>; 

This opened an interactive command line dialog to generate the certs. Once generated you need to download the certs and connect to heroku
*/
// Response to ACME LetsEncrypt Free SSL
//HOW TO RENEW
//./letsencrypt-auto renew --dialog
//scp root@xxx.xxx.xxx.xxx:/etc/letsencrypt/live/domain/cert.pem cert.pem
//scp root@xxx.xxx.xxx.xxx:/etc/letsencrypt/live/domain/privkey.pem privkey.pem
//heroku certs:update cert.pem privkey.pem --app tagstacks --confirm tagstacks

app.get('/.well-known/acme-challenge/<key>',function(req,res){
  res.send('<key response>');
});
/*
===================================================
Express Related Server Functions
===================================================
*/
//Forcing SSL
var env = process.env.NODE_ENV || 'development';
var forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
};
if (PARAMS.IsProduction) {
    //AR parse doesn't work with forced ssl?
    app.use('/login',forceSsl);
    app.use('/signup',forceSsl);
    //app.use(unless('/parse', forceSsl));
}


/*
===================================================
Express Related Server Functions
===================================================
*/
var UploadHandler = require('./controllers/uploader.js');
var uploadHandler = new UploadHandler(CONFIG.AWS);

var SecurityController = require('./controllers/security.js');
var securityController = new SecurityController();

var UserController = require('./controllers/user.js');
var userController = new UserController();

var DataContext = require('./utils/datacontext.js');

//auth sources
var OAuthCallBackHandler = function(req, res, params) {

  var db = DataContext(req,_PARSE_KEYS,true);
  db.cloudRun('oauth', params, function(pbody) {
  
      userController.oauth(req, res,pbody,PARSE_KEYS_FOR_UI);
  });
}

var OAuthErrorHandler = function(req, res, error) {
 
  if(error)
  {
    var err = JSON.stringify(error);
    userController.oauthError(req, res,PARSE_KEYS_FOR_UI,err);
  }
  else
    userController.oauthError(req, res,PARSE_KEYS_FOR_UI,"Looks like we are unable to create your account. Please try again.");
}


// Create `ExpressHandlebars` instance with a default layout.
var _CUSTOM_VIEW_PATH = __dirname.replace('backend_scaffold','webui/views');
var _CUSTOM_PUBLIC_PATH = __dirname.replace('backend_scaffold','webui/public');
var hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir:_CUSTOM_VIEW_PATH+'/layouts'
    });


//setup routes
app.set('views',_CUSTOM_VIEW_PATH)
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

/*
//AR: There are performance issues with these only enable at specific endpoints
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))
*/

app.use(securityController.handler);
app.use('/css', express.static(_CUSTOM_PUBLIC_PATH + '/css'));
app.use('/scripts', express.static(_CUSTOM_PUBLIC_PATH + '/scripts'));
app.use('/images', express.static(_CUSTOM_PUBLIC_PATH + '/images'));

app.use('/parse', parseServer);


/*
===================================================
OAuth Related
===================================================
*/
//AR: TODO migrate to dynamic loading
//Setup dynamic code snippets
/*
http://my-data.herokuapp.com/google/analytics/event/copy/7daysAgo

http://stackoverflow.com/questions/27090124/node-js-dynamic-javascript-execution-performance
var context = vm.createContext({});
// this snippet should be user supplied, arbitrary javascript
var script = vm.createScript('(function (input) { return input.length; })');
var fn = script.runInContext(context);

rd.on('line', function(line) {
    console.log(fn(line));
});
*/
var Google = require('./oauth/google.js');
var Facebook = require('./oauth/facebook.js');
var Twitter = require('./oauth/twitter.js');


var source = {
  google: new Google({
    PEM:CONFIG.OAUTH.google.PEM,
    ClientId:CONFIG.OAUTH.google.ClientId,
    CLIENT_SECRET:CONFIG.OAUTH.google.CLIENT_SECRET,
    AppCallBackURL:URL+"/auth/google/callback",
    },OAuthCallBackHandler,OAuthErrorHandler),
  facebook: new Facebook({
      AppId:CONFIG.OAUTH.facebook.AppId,
      AppSecrect:CONFIG.OAUTH.facebook.AppSecrect,
      AppCallBackURL:URL+"/auth/facebook/callback",
    },OAuthCallBackHandler,OAuthErrorHandler),
  twitter: new Twitter({
    ConsumerKey:CONFIG.OAUTH.twitter.ConsumerKey,
    ConsumerSecret:CONFIG.OAUTH.twitter.ConsumerSecret,
    AppCallBackURL:URL+"/auth/twitter/callback",
  },OAuthCallBackHandler,OAuthErrorHandler)
}

app.get('/auth/*',function(req,res){

  var p = req.path.split('/');
  var parts =[];
  for(var i = 0; i < p.length; i++)
  {
    if(p[i].length > 0)
    {
      parts.push(p[i]);
    }
  }

  try{

    var sourceType = parts[1];
    
    if(parts.length == 2)
    {
      if(source[sourceType])
        source[sourceType].auth(req,res,_PARSE_KEYS);
      else
        res.render('access_error',{error:"Unable to Perform Auth:"+sourtType,KEYS:PARSE_KEYS_FOR_UI});
    }//handles callback
    else if(parts.length == 3)
    {
      if(source[sourceType])
        source[sourceType].authCallback(req,res,_PARSE_KEYS);
      else
       res.render('access_error',{error:"Unable to Perform Callback Auth:"+sourtType,KEYS:PARSE_KEYS_FOR_UI});
    }

  }catch(ex){console.log(ex)}
});


// Handles all signature requests and the success request FU S3 sends after the file is in S3
app.get("/uploader", function(req, res) {
    uploadHandler.getPolicy(req,res);
});

app.get('/login', function(req, res){
  res.render('login',{KEYS:PARSE_KEYS_FOR_UI});
});
app.get('/signup', function(req, res){
  res.render('signup',{KEYS:PARSE_KEYS_FOR_UI});
});

app.get('/*', function(req, res,next){

  var p = req.path.split('/');
  if(p[1] == 'parse')
    next();
  else
  {
    var isLoggedIn = false;
    var db = DataContext(req,_PARSE_KEYS)
    if(db.sessionToken) //Is the user already logged in?
    {
      isLoggedIn = true;
    }
    res.render('app',{isLoggedIn:isLoggedIn,KEYS:PARSE_KEYS_FOR_UI});
  }



});


server.listen(port);