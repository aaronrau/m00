//installing 
//npm install --only=dev

var concat = require('gulp-concat')
	,gulp = require('gulp')
	,watch = require('gulp-watch')
 	,rename = require('gulp-rename') 
 	,sourcemaps = require('gulp-sourcemaps') 
 	,s3 = require("gulp-s3")
 	,replace = require('gulp-replace')
 	,uglifycss = require('gulp-uglifycss')
 	,uglify = require('gulp-uglify')
 	,argv = require('yargs').argv;

var fs = require('fs');

//script paths
var deployment_domain = '<cdn.domain.com>';
var path = '../webui/public/scripts/'
var jsFiles = [
				'app.js'
				,'app.util.js'
				,'app.popup.js'
				,'app.dal.js'
				,'app.controller.js'
				,'app.login.js'
				,'app.controls.js'
				],  
	jsMin = 'app.min.js';

var cssFiles 

var cssPath = '../webui/public/css/'
var cssFiles = [
				'app.css'
				,'app.signup.css'
				,'app.account.css'
				],  
	cssMin = 'app.min.css';

var version = null;
if(argv.ver)
	version = 'v'+argv.ver


var s3_options = { headers: {'Cache-Control': 'max-age=315360000, no-transform, public'}}
if(argv.ver)
	s3_options.uploadPath = version+'/';


//build modules and sections


//add path
for(var i = 0; i < jsFiles.length; i++)
{
	jsFiles[i] = path + jsFiles[i];
	
}

for(var i = 0; i < cssFiles.length; i++)
{
	cssFiles[i] = cssPath + cssFiles[i];
}


//gulp deploy --ver 2
gulp.task('deploy', function() {
	var upload_files = [];

	var aws = JSON.parse(fs.readFileSync('./aws.config.json'));
	gulp.src(['../webui/public/scripts/app.*'])
	.pipe(s3(aws,s3_options));
});

gulp.task('deploy_prod', function() {
	var upload_files = [];

	var aws = JSON.parse(fs.readFileSync('./aws.prod.config.json'));
	gulp.src(['../webui/public/scripts/app.*'])
	.pipe(s3(aws,s3_options));
});

gulp.task('prod', ['compress_prod','deploy_prod']);
gulp.task('compress_prod', function() {
    return gulp.src(jsFiles)
    	.pipe(sourcemaps.init())
        .pipe(concat(jsMin))
        .pipe(gulp.dest(path))
        .pipe(rename(jsMin))
        .pipe(uglify())
        .pipe(sourcemaps.write('./',{sourceMappingURLPrefix:"https://"+deployment_domain+(version ? version : "")}))
        .pipe(gulp.dest(path));
});

//gulp distro --v 2
gulp.task('distro', function() {

	gulp.src(['../backend_scaffold/**/*']).pipe(gulp.dest('../distro/backend_scaffold'));
	//gulp.src(['../webui/**/*']).pipe(gulp.dest('../distro/backend_scaffold'));
	gulp.src(['../backend_parse_code/**/*']).pipe(gulp.dest('../distro/backend_parse_code'));

	gulp.src(['../webui/views/**/*'])
		.pipe(replace('/scripts/app.min.js', 'https://a.m00.co/'+(version ? version +'/': "")+'app.min.js'))
		.pipe(gulp.dest('../distro/webui/views'));

	gulp.src(['../webui/public/css/app.min.css.map']).pipe(gulp.dest('../distro/webui/public/css/'));
	gulp.src(['../webui/public/css/app.min.css']).pipe(gulp.dest('../distro/webui/public/css/'));
	gulp.src(['../webui/public/css/app.css']).pipe(gulp.dest('../distro/webui/public/css/'));
	gulp.src(['../webui/public/images/**/*']).pipe(gulp.dest('../distro/webui/public/images'));

	
	gulp.src(['../webui/public/scripts/app.min.js']).pipe(gulp.dest('../distro/webui/public/scripts/'));
	gulp.src(['../webui/public/scripts/app.min.js.map']).pipe(gulp.dest('../distro/webui/public/scripts/'));
	
});



gulp.task('compress', ['js','css']);


gulp.task('js', function() {
    return gulp.src(jsFiles)
    	.pipe(sourcemaps.init())
        .pipe(concat(jsMin))
        .pipe(gulp.dest(path))
        .pipe(rename(jsMin))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path));

});


gulp.task('css', function() {
    return gulp.src(cssFiles)
    	.pipe(sourcemaps.init())
        .pipe(concat(cssMin))
        .pipe(gulp.dest(cssPath))
        .pipe(rename(cssMin))
        .pipe(uglifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(cssPath));
});



gulp.task('watch', function() {  
	gulp.watch(['../webui/public/css/*.css','!../webui/public/css/*.min.css','../webui/public/scripts/*.js','!../webui/public/scripts/*.min.js','!../webui/public/scripts/*.src.js'],['compress']);   
});

gulp.task('default', ['compress', 'watch']);
//gulp.task('default', ['watch']);

