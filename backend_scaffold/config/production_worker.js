var config = {
	"PARSE_KEYS":{
		"APP_ID":"<RANDOM APP ID>",
		"REST_API":"<RANDOM KEY>",
		"MASTER_KEY":"<RANDOM KEY>",
		"JAVA_SCRIPT":"<RANDOM KEY>"
	},
	"AWS":{
		"SECRET_KEY":"<AWS SECRET>",
		"ACCESS_KEY_ID":"<AWS ACCESS KEY>",
		"DEFAULT_BUCKET":"<S3 BUCKET NAME>"
	},
	"MONGODB":"mongodb://dbuser:password@domain/database",
	"REDIS":"redis://localhost:6379",
	"REDIS_AUTH":null, //AR:not sure why heroku worker doesn't need this
	"OAUTH":{
		"google":{
		    "PEM":{
		    	/*
		      PEM JSON Format goes here
		      */
		    },
		    "ClientId":"<Google API Client ID>",
		    "CLIENT_SECRET":"<Google API Client Secret>"
			},
		"facebook":{
		      "AppId":"<Facebook App ID>",
		      "AppSecrect":"<Facebook App Secret>"
			},
		"twitter":{
			    "ConsumerKey":"<Twitter ConsumerKey>",
			    "ConsumerSecret":"<Twitter ConsumerSecret>"
			}
	},
	"SENDGRID":{
		"Key":"<Sendgrid Key>",
		"Secret":"<Sendgrid Secret>"
	}
}

module.exports = config;