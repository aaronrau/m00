
/*
//Examples:

var defaultAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:32.0) Gecko/20100101 Firefox/32.0';
        headers: {
            'User-Agent': defaultAgent,
            'Accept-Language':'en-US,en;q=0.5',
            'Accept-Encoding':'text/html'
          }

//Streaming Example ----------
var options = {
  viewport : screensize,
  thumbnail_max_width : resolutionWidth,
  protocol: 'http'
}
 
//Get the URL 
var url = url2png.buildURL('google.com' options);
 
//...or download the image to a file 
var fs = require('fs');
url2png.readURL('google.com' options).pipe(fs.createWriteStream('google.png'));
 
//...or send the image in the http response 
var http = require('http');
http.createServer(function (req, res) {
  if (req.url === '/google.png') {
    url2png.readURL('google.com' options).pipe(res)
  }
});

//simple------------------
https://www.npmjs.com/package/s3-upload-stream

var options = {
  viewport : '1024x1024',
  thumbnail_max_width:450,
  fullpage:true
}

//Get the URL 
var screenshot = 'https:'+URL2PNG.buildURL(url,options);  


});
*/

Parse.Cloud.define("webcapture", function(request, response) {
  Parse.Cloud.useMasterKey();

  var url = request.params.url;
  var screensize = request.params.viewport;
  var tmbWidth = request.params.thumbnailWidth;
  var fullpage = request.params.fullpage

  var KEY = '<png 2 url key>';
  var SECRET = '<png 2 url secret>';

  var options = {
    viewport : screensize,
    thumbnail_max_width:parseInt(tmbWidth),
    fullpage:false
  }

  if(fullpage)
    options.fullpage = true;

  var URL2PNG = require('url2png')(KEY, SECRET);

  //Get the URL 
  try{

    var screenshot = 'https:'+URL2PNG.buildURL(url,options);  

    console.log(screenshot);
    
    response.success({
      site:url,
      screenshot:screenshot,
      thumbnails:{
        "1024x768":"", //desktop
        "320x568":"", // mobile

      },
      options:options
    })

  }catch(ex){
    response.error(ex.toString());
  }

});
