/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// top-level namespace being assigned an object literal
var app = app || {};

//core framework functions  --------------------------
app.Ext = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];

    if (!obj)
      continue;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object')
          out[key] = app.Ext(out[key], obj[key]);
        else
          out[key] = obj[key];
      }
    }
  }

  return out;
};
Element.prototype.addELM = function(object) {
  var elm = object;
  if (object.getHTML) {
    elm = object.getHTML();
  }
  return (this.appendChild(elm));
}
Element.prototype.insertELM = function(object)
{ //Insert into top of stack

    var elm = object;

        
    if(object.getHTML)
    {
      elm = object.getHTML();
    }
    
    var firstChild = this.firstChild;
    if(firstChild)
    {
      return (this.insertBefore(elm, firstChild));
    }
    else
    {
      return(this.appendChild(elm));
    }
}
Element.prototype.removeELM = function(object) {
  var elm = object;
  if (object.destroy) {
    object.destroy();
  }
  if (object.getELM) {
    elm = object.getELM();
  }
  return (this.removeChild(elm));
}

function cELM(tag,classes)
{
  var e = document.createElement(tag); 
  if (classes) {
    e.className = classes;
  };
  
  return e
}

//global auth / init functions --------------------------
//AR TODO migrate to app?


var logout = function() {
  setCookie('username', "", 325);
  setCookie('userId', "", 325);
  setCookie('session_token', "", 325);

  Parse.User.logOut();

  setTimeout(function() {
    location.reload();
  }, 800);
}

var _LOGIN_PARAMS = null;


app.Start = function(params,before,after) {

  document.addEventListener("DOMContentLoaded", function(event) { 
    app.Init(params,before,after);
  });

}
app.FF = function(feature_flag)
{
  return app.Controller.checkFeature(feature_flag);
}
app.Init = function(params,before,after) {

  if(before)
      if(!before())
        return;

  var sections = params.sections ? params.sections : {};

  
  var currentUser = Parse.User.current();
  if(currentUser)
  {
    var usect = currentUser.get('sections');
    var overrideSections = currentUser.get('overrideSections');
    var sectionBadges = currentUser.get('sectionBadges');
    app.Controller.sectionBadges = sectionBadges;
    
    app.Controller.setFeatureFlags({});
    if(overrideSections && usect)
    {
      var ff = {};
      for(var s in usect)
      {
        if(usect[s]["features"])
        {
          for(var f in usect[s]["features"])
          {
            var enabled = usect[s]["features"][f];
            if(enabled)
            {
              ff[s.toUpperCase()+'-'+f.toUpperCase()] = true;  
            }
            
          }
        }
      }
      
      app.Controller.setFeatureFlags(ff);
    }

    if(usect)
      if(overrideSections)
      {
        sections = usect;
      }
      else
      {
        for(var s in usect)
        {
          sections[s] = usect[s];
        }
      }    
  }

  

  if (document.getElementById('btLogin')) {
    if (currentUser) {
      document.getElementById('btLogin').style.display = 'none';

      var nameArea = document.getElementById('username');
      if(nameArea)
        nameArea.innerHTML = currentUser.get("username");

      var profile = document.getElementById('userprofile');

      var profileURL = currentUser.get("profileURL");
      if (!profileURL) {
        profileURL = '/images/profile_default.png';
      }

      var nBtProfile = new app.controls.ExpandButton({
        button_text: "<img src=" + profileURL + ">",
        classname: 'profile_nav',
        selections: [{
          classname: 'ep_logout',
          text: 'Logout',
          detailText: 'Signout of my current account',
          onclick: function() {
          logout();
          }
        }]
      });

      if(nameArea)
        nameArea.onclick = function(e) {
          nBtProfile.click(e);
        }

      profile.addELM(nBtProfile);

    } 
    else {
      if(document.getElementById('username'))
        document.getElementById('username').style.display = 'none';
      document.getElementById('userprofile').style.display = 'none';
    }
  }
  else {
    if(params)
    {
      if(params.login)
      {
        
        initLoginType(params);      
      }
      else
      {
        initLoginType('login');    
      }

    }
    else
    {
      initLoginType('login');
    }
  }

  if(params)
    if(params.login)
    {
      _LOGIN_PARAMS = params.login;

    }

  app.Controller.initSectionSelections(sections);
  app.Controller.showSection();
  
  if(after)
    after();
}


var logo = function() {
  window.location = '/';
}

//AR:todo clean up
var popup;
var lPopup;
var initLoginType = function(params) {

  var _params = null;
  var _mode = null;
  if(typeof params === 'object')
  {
    _mode = params.login.mode;
    _params = params;

    _LOGIN_PARAMS = params.login;

  }
  else if(typeof params === 'string')
  {
    _mode = params; // type
    _LOGIN_PARAMS = params;
  }


  var contentType = document.getElementById(_mode + '_page');
  if (contentType) {
    var content = new app.Login(_params ? _params.login : _mode, function(user) {
      onLoginSuccess(user);
    })
    contentType.addELM(content);
  }

}

var onLoginSuccess = function(user) {

  setCookie('userId', user.id, 325);
  setCookie('session_token', user.getSessionToken(), 325);
  //setCookie('username',user.get('fbUsername'),325);
  setTimeout(function() {

    var lastLoginPath = getCookie('lastLoginPath');

    if(!IsEmpty(lastLoginPath))
    {
      if(lastLoginPath == 'null')
      {
        window.location = '/';
      }
      else
      {
        var currentPath = window.location.toString();
        if(lastLoginPath.indexOf('#') > -1 && currentPath == lastLoginPath)
        {
          window.location.reload();
          return;
        }
        else
        {
          window.location = lastLoginPath;
        }
      }
    }
    else
    {
      window.location = '/';  
    }
    
  }, 800);
}



var loginPopup = function(isDisableClose) {
  lPopup = new app.Popup();


  lPopup.init(new app.Login(_LOGIN_PARAMS, function(user) {
    onLoginSuccess(user);
  }));

  if(isDisableClose)
    lPopup.disableClosing(true);

  lPopup.show(true);
}

var startLogin = function() {


  if(!lPopup)
  {
    lPopup = new app.Popup();
      lPopup.init(new app.Login(_LOGIN_PARAMS, function(user) {
        onLoginSuccess(user);
      }));    
  }
  
  lPopup.show(true);
}
