/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Crypto = require("crypto"),
    AWS = require("aws-sdk");

var _this = function(AWSConfig){

  var BUCKET = AWSConfig.DEFAULT_BUCKET;

  AWS.config.update({accessKeyId: AWSConfig.ACCESS_KEY_ID, secretAccessKey: AWSConfig.SECRET_KEY});

  return {
      deleteObjects:function(path,req,res)
      {
          var s3 = new AWS.S3();
          var s3_params = {
              Bucket: BUCKET,
              Delete: { // required
                  Objects: [] // required
              }
          };

          var fp = path.split('/');

          var key = fp[fp.length-1];

          s3_params.Delete.Objects.push(key)

          s3.deleteObjects(params, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
              else {
                  res.write(JSON.stringify(return_data));
                  res.end();
              } // successful response
          });     
      },
      getPolicy:function(req,res)
      {
          var fileId = Crypto.randomBytes(20).toString('hex').toUpperCase();

          var prefix = "bl_";
          var newFileName = prefix+fileId;//req.query.fileName;

          var s3 = new AWS.S3();
          var s3_params = {
              Bucket: BUCKET,
              Key: newFileName,
              Expires: 60,
              ContentType: req.query.fileType,
              ACL: 'public-read'
          };
          s3.getSignedUrl('putObject', s3_params, function(err, data){
              if(err){
                  console.log(err);
              }
              else{
                  var return_data = {
                      signedRequest: data,
                      uploadURL: 'https://'+BUCKET+'.s3.amazonaws.com/'+newFileName,
                      downloadURL: 'http://'+BUCKET+'/'+newFileName//'http://'+BUCKET+'.s3-website-us-east-1.amazonaws.com/'+newFileName,
                  };
                  res.write(JSON.stringify(return_data));
                  res.end();
              }
          });


      }

  }

}

module.exports = _this;