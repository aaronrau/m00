/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
  "use strict";

  var _doc = document;
  var _getElmById = function(id){
    return _doc.getElementById(id);
  }
  var _getElmByClass = function(className){
    return _doc.getElementsByClassName(className)
  };

  var HOST = "";
  var SECTION_PATH = "/scripts/sections/";
  var MODULE_PATH = "/scripts/modules/";
  var CSS_PATH = "/css/"

  //private variables
  var _windowPosition = [],
      _popupStacks = [],
      _sectionParams = {},
      _currentSection = null,
      _sections = {},
      _modules ={}

  var _SectionNavButtons = {};
  var _SectionNavBadges = {};
  var _notificationElm = null;
  var _featureFlags = {};

  //private function
  var _loadSection = function(sName){


      if(IsEmpty(sName))
        return

      var container = _getElmById('scroll_content');

      var defaultPath = SECTION_PATH+sName+".js";

      if(_sectionParams[sName])
      if(_sectionParams[sName].host)
        defaultPath = _sectionParams[sName].host + SECTION_PATH+sName+".js";


      var titleArea = null;
      var hs = _getElmByClass('controls_header');
      if(hs)
      {
        if(hs.length > 0)
        {
          hs[0].className = 'controls_header '+ sName+'_header'
          var ht = hs[0].querySelector('#header_title');
          if(ht)
          {
            ht.innerHTML = '';
            var param = _sectionParams[sName];
            if(param)
              if(param.title)
              {
                ht.innerHTML = param.title;
                titleArea = ht;
              }
          }

        }
      }
      
      var buttonId = 'bt' + sName.toTitleCase();
      var badge = _SectionNavBadges[buttonId];


      var _renderSection = function(sName){

        require([SECTION_PATH+sName+".js"], function(section) {

            
            _sections[sName] = section;
            section.init(app.User.isLogin(),container,titleArea,badge);          
            section.render();

            _currentSection = _sections[sName];
        },function(err){
          //console.log(sName);
          console.log(err);
          _currentSection = null;
        }); 
        
      }



      if(!app.Mod(sName))
      {
        console.log('no modules found');
        LoadCSS(CSS_PATH+sName+'.css');
        app.RegMods([sName],function(){
            _renderSection(sName);
        })
      }
      else
      {
        _renderSection(sName);
      }



           
  }



  app.Ext(app, {
    //module registration
    Mod:function(sName)
    {
      return _modules[sName];
    },
    RegMod:function(name,mod)
    {
      if(_modules[name])
        return mod

      _modules[name] = mod;
    },
    RegMods:function(names,callback)
    {

      var paths = [];
      var moduleNames = names;
      for(var i = 0; i < moduleNames.length; i++)
      {
        var mName = moduleNames[i];
        if(!app.Mod(mName))
        {
          var defaultPath = MODULE_PATH+mName+".js";
          if(_sectionParams[mName])
          if(_sectionParams[mName].host)
            defaultPath = _sectionParams[mName].host + MODULE_PATH+mName+".js";

          paths.push(defaultPath);
        }          
      }

      if(paths.length > 0)
      {
        require(paths, function() {
         
          for(var i = 0; i < arguments.length; i++)
          {
            app.RegMod(moduleNames[i],arguments[i])
          }
          
          callback(paths);
        
        },function(err){
          console.log(err);
          callback(null);

        });
      }

    },
    Bind:function(module,componentsNames,objects)
    {
      /*
      @aaronrau: different name spaces and 2 deep name space are not supported right now such as 
        ["namespace_a.component","namespace_b.component","namespace_a.sub_namespace_a.component"]
      
      */

        for(var n in objects)
        {
          var i = parseInt(n);
          if(isNaN(i))
            continue;
          
          var uicomponent = objects[n];
          var paths = componentsNames[n].split('/');
          var names = paths[paths.length-1].split('.');
          var name = names[1].toTitleCase();
          var moduleName = names[0].toLowerCase();
          
          if(names[1] == 'DAL')
            name = 'DAL';

          //console.log(name);
          if(!app.Mod(moduleName) && names.length == 2)
            app.RegMod(moduleName,uicomponent);
          
          var ext = {}; ext[name] = uicomponent;
          app.Ext(module,ext);
        }

      


    },
    User:{
      get:function()
      {
        return Parse.User.current();
      },
      become:function(token,error){

        if(IsEmpty(error))
        {

          Parse.User.become(token).then(function(result){
            
            var currentUser = Parse.User.current();
            onLoginSuccess(currentUser);
            
          });

        }
        else
        {
          alert(error);
          //document.getElementsByClassName('')
        }

      },
      isLogin:function()
      {     
        var currentUser = Parse.User.current(); 
        return currentUser ? currentUser : false;
      },
      login:function(callback){
        //todo
      },
      logout:function(callback){

        app.DAL.logout();

        setTimeout(function() {
          if(callback)
            callback();
          else
            location.reload();
        }, 800);

      }
    },
    Controller: {
      sectionBadges:null,
      checkFeature:function(feature_flag)
      {
        return _featureFlags[feature_flag];
      },
      setFeatureFlags:function(flags)
      {
        _featureFlags = flags;
      },
      lockWindow: function() {
        _windowPosition = [
          self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
          self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        ];
        var html = document.getElementsByTagName('html')[0]; // it would make more sense to apply this to body, but IE7 won't have that
        html.data = {};
        html.data['scroll-position'] = _windowPosition;
        html.data['previous-overflow'] =  html.style.overflow;
        html.style.overflow = 'hidden';
        window.scrollTo(_windowPosition[0], _windowPosition[1]);
      },
      unlockWindow: function() {
        // un-lock scroll position
        var html = document.getElementsByTagName('html')[0];
        var scrollPosition = html.data['scroll-position'];
        html.style.overflow = html.data['previous-overflow'];
        window.scrollTo(scrollPosition[0], scrollPosition[1]);
      },
      clearNotification:function(){
        var nt = document.getElementById('notification');
        if(nt)
        {
          if(_notificationElm)
          {
            nt.removeChild(_notificationElm);
            _notificationElm = null;
          }
          else
          {
            nt.innerHTML = "";
          }
        }
      },
      setNotification:function(elm)
      {
        

        var nt = document.getElementById('notification');
        if(nt)
        {

          if(_notificationElm)
          {
            nt.removeChild(_notificationElm);
            _notificationElm = null;
          }
          else
          {
            nt.innerHTML = "";
          }

          if(typeof elm == 'string')
          {
             nt.innerHTML = elm;
          }
          else if (typeof elm == 'object')
          {
            _notificationElm = elm;
            nt.addELM(elm)
          }
        }
      },
      closePopovers:function(e)
      {
        if(app.controls.expandButtons)
        for(var i = 0; i < app.controls.expandButtons.length; i++)
        {
          var item = app.controls.expandButtons[i];
          if(item.style.display != 'none')
            item.style.display = 'none';
        }
      },
      pushPopup:function(popup,path)
      {
        _popupStacks.push(popup);

        //console.log(history.length);

        //console.log(path);

        var r = Math.random();
        var state ={"objectHash":r};
        
        //if(event.state)


        if(window.location.pathname == path)
        {
          var p = path.split('/');
          window.history.replaceState(state, r, '/'+p[1]);
        }
      
        window.history.pushState(state, r, path);     
        
   
        window.onpopstate = function(event) {

          //console.log(history.length);
          /*
          if(event.state) // AR: needed for safari
          {
            var p = _popupStacks.pop();
            if(p)
            {
              p.hide();
            } 
          }*/
        
          var p = _popupStacks.pop();
          if(p)
          {
            p.hide();
          } 

        }

        
      },
      popPopup:function()
      {
        window.history.back();
      },
      //TODO: http://spoiledmilk.com/blog/html5-changing-the-browser-url-without-refreshing-page/
      initSectionSelections: function(sectionNames) {

        window.onscroll = function(e)
        { 
          app.Controller.closePopovers(e);
        }

        _sectionParams = sectionNames;
        _sections = {};

        var fs = _getElmByClass('controls_footer');
        var footer = null;
        if(fs)
          footer = fs[0];
        
        if(footer)
        {
          footer.innerHTML = '';
          var ul = cELM('ul');
          footer.addELM(ul);

          //console.log(sectionNames);
          //build footer controls
          for (var section in _sectionParams) {
          
            _sections[section] = null;

            var buttonId = 'bt' + section.toTitleCase();

            var w = cELM('li');
            var anc = cELM('a');
            var bt = cELM('div','button '+buttonId);
            anc.addELM(bt);
            anc.value = buttonId;
            anc.section = section;
            anc.onclick = function(e) {
                var url = document.location.href;



                if (window.history.pushState) {
                  // supported.
                  window.history.pushState(this.section, "", "/"+this.section);
                }
                else
                {
                  var base = url.indexOf('#') > -1 ? url.split('#')[0] : document.location.href;
                  var part = this.value.substr(2, this.value.length - 2).toLowerCase();
                  document.location.href = base + "#" + part;

                }
               
                app.Controller.showSection();
              }

            w.addELM(anc);
            
            if(_sectionParams[section].hasBadge)
            {
              var badge = cELM('div','badge badge'+section.toTitleCase());
              anc.addELM(badge);
              _SectionNavBadges[buttonId] = badge;

              if(_CTRL().sectionBadges)
              {
                  if(_CTRL().sectionBadges[section])
                    badge.innerHTML = _CTRL().sectionBadges[section];
              }
            }

            ul.addELM(w);

            _SectionNavButtons[buttonId] = bt;


          }
        }
       
      },
      showSection: function(initSectionName) {
        
        var loc = document.location.toString();
        if(loc.indexOf('/auth/') >-1 ||
          loc.indexOf('/login') >-1 ||
          loc.toString().indexOf('/signup') >-1)
          return;

        var paths = [] 
        if(window.history.pushState)
        {
          paths = getURLParts(document.location);
        }
        else
        {
          paths = getURLHashPath(document.location);
        }
        var sName = "";

        if(initSectionName)
          sName = initSectionName;
        else
        {
          //update buttons and path
          if (paths.length > 0) {
            var part = paths[0];
            sName = part;
          }
          else { //show first one
            for (var sn in _sections) {
              sName = sn;
            

              if(window.history.pushState)
              {
                window.history.pushState(sName, "", "/"+sName);
              }
              else
              {
                document.location.href = document.location.href + '#' + sName;
              }

              break;
            }
          }
        }



        var csec = _currentSection;
        if(csec)
          if(csec.clear)
            csec.clear();

        //select current button
        for(var bId in _SectionNavButtons)
        {
          var bt = _SectionNavButtons[bId];
          bt.className = 'button ' + bId;
        }


        var bId = 'bt' + sName.toTitleCase();
        if (_SectionNavButtons[bId]) {
          var bt = _SectionNavButtons[bId];
          if (bt) {
            bt.className = 'button ' + bId + "_selected";
          }
        }

        var hs = _getElmByClass('controls_header');
        if(hs)
        {
          if(hs.length > 0)
          {
            hs[0].className = 'controls_header '+ sName+'_header'
            var ht = hs[0].querySelector('#header_title');
            if(ht)
            {
              ht.innerHTML = '';
              var param = _sectionParams[sName];
              if(param)
                if(param.title)
                {
                  ht.innerHTML = param.title;
                }
            }

          }
        }

        var sec = _sections[sName];
        if (sec) {
          sec.render();
          _currentSection = _sections[sName];

        }
        else
        {
          var param = _sectionParams[sName];

          if(param)
          if(param.mods)
          if(param.mods.length > 0)
            return app.RegMods(param.mods,function(){
              if(param.css)
                LoadCSS(param.css);
              //load section from JS TODO: might have to add a loading sign if this is too slow;
              _loadSection(sName);
            })
          

          return _loadSection(sName);
          
        }




      }
    }

  });

}());
