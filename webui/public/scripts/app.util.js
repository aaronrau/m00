function isMobile()
{
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function checkBrowserCompatibility()
{

}

function HtmlEncode(s)
{
  var el = document.createElement("div");
  el.innerText = el.textContent = s;
  s = el.innerHTML;
  return s;
}

function IsEmpty(str) {
    return (!str || 0 === str.length || /^\s*$/.test(str));
}

function contains(str1,str2)
{
	return str1.indexOf(str2) != - 1;
}

function RGBAObjToHex(color)
{
	var r = parseInt(255*color.r);
	var g = parseInt(255*color.g);
	var b = parseInt(255*color.b);

	
	return '#'+r.toString(16)+g.toString(16)+b.toString(16);

}

function GetScreenDim(){
	var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    return ({
    	width:x,
    	height:y
    })
}

function LoadCSS(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;

    var h = false;
    for(var i = 0; i < document.getElementsByTagName("head")[0].children.length; i++)
    {
    	var c = document.getElementsByTagName("head")[0].children[i];
    	if(c.href == link)
    	{
    		h = true;
    		break;
    	}	
    }

    if(!h)
    	document.getElementsByTagName("head")[0].appendChild(link);
}
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function URLFriendly(str)
{
	if(!IsEmpty(str))
	{
		var result = str.toLowerCase().replace(/^\s+|\s+$/g,'').replace(/[^a-zA-Z\d\s]/g, '').replace(/\s/g,'-');
	    return(result);
	}
	else
	{
		return "";
	}

}

function URLFriendlyTags(str)
{
	var result = str.toLowerCase().replace(/^\s+|\s+$/g,'').replace(/[^a-zA-Z\d\s]/g, '').replace(/\s/g,'+');
    return(result);
}
function setCookie(cname,cvalue,exdays)
{
	var d = new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	//document.cookie = cname + "=" + cvalue + "; " + expires +";domain=app-dev.bestlyst.com:5000;path=/";
	document.cookie = cname + "=" + cvalue + "; " + expires +";path=/";
}
function getCookie(name)
{
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}
function getStoredKVP(key)
{
	if(typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    	return localStorage.getItem(key);
	} else {
	    // Sorry! No Web Storage support..
	    return getCookie(key);
	}
}
function setStoredKVP(key,value)
{
	if(typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    	localStorage.setItem(key, value);
	} else {
	    // Sorry! No Web Storage support..
	    setCookie(key,value,325);

	}
}
String.prototype.toTitleCase = function() {
  var i, j, str, lowers, uppers;
  str = this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless 
  // they are the first or last words in the string
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At', 
  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), 
      function(txt) {
        return txt.toLowerCase();
      });

  // Certain words such as initialisms or acronyms should be left uppercase
  uppers = ['Id', 'Tv'];
  for (i = 0, j = uppers.length; i < j; i++)
    str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), 
      uppers[i].toUpperCase());

  return str;
}

function httpGet(url, params,callback)
{
	var p = "";
	if(params)
	{
		var n = new Date().getTime();

		for(var prop in params)
		{
			p += p+'&'+prop+"="+params[prop];
		}

		if(url.indexOf('?') > -1)
		{
			p = '&dt='+n+p;
		}
		else
		{
			p = '?dt='+n+p;
		}
	}

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
        	try{
        		callback(JSON.parse(xmlHttp.responseText));
        	}catch(ex){
        		callback(xmlHttp.responseText);
        	}
        	
        }
    }
    xmlHttp.open("GET", url+p, true); // true for asynchronous 
    xmlHttp.send(null);
}

function getURLParts(url)
{
	var parts = [];
	var result = {};
	var p = url.pathname.split( '/' );
	for(var i = 0; i < p.length; i++)
	{
		if(i > 0)
			if(!IsEmpty(p[i]))
				parts.push(p[i]);
	}
	return parts;	
	
}
function getURLHashPath(url){

	var parts = [];

	if(url.hash) {
		query = url.hash.substr(1);
		var result = {};
		query.split("/").forEach(function(part) {
		
			parts.push(part);
		});
		return parts;	
	}
	

	return parts

}
function getURLQueryParams(key,url) {

	var query = {};

	if(url.hash) {
		query = url.hash.substr(1);
		var result = {};
		query.split("&").forEach(function(part) {
		var item = part.split("=");
			result[item[0]] = decodeURIComponent(item[1]);
		});
		return result;		
	  // Fragment exists
	} else {
		query = url.search.substr(1);
		var result = {};
		query.split("&").forEach(function(part) {
		var item = part.split("=");
			result[item[0]] = decodeURIComponent(item[1]);
		});
		return result;
	}



}