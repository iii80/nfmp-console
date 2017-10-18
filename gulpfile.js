var gulp = require('gulp');
var gutil = require( 'gulp-util' );
// var filter = require('gulp-filter');
//var changed = require('gulp-changed');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-clean-css');
var plumber = require( 'gulp-plumber' );
var templateCache = require('gulp-angular-templatecache');
var del = require('del');

/**
 * 错误处理
 */
function error (event) {
  gutil.beep();
  gutil.log(event);
}

/**
 * 清除 public/assets_admin
 */
gulp.task('clean', function(cb) {
  return del(['./public/assets/**/*'], cb);
});

/**
 * 开发模式编译 Less
 */
gulp.task('build-admin-assets', ['clean'], function () {
  return gulp.src('./src/less/import.less')
    .pipe(plumber({ errorHandler: error }))
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * 生产模式编译 Less
 */
gulp.task('build-admin-assets-less', ['clean'], function () {
  return gulp.src('./src/less/import.less')
    .pipe(less())
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(minify())
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * vendor js 源
 */
var vendorSrcJS = [
  './src/vendor/jquery-2.2.3/jquery.js',
  './src/vendor/async-1.5.2/async.js',
  './src/vendor/lodash-4.11.1/lodash.js',
  './src/vendor/angular-1.3.19/angular.js',
  './src/vendor/angular-1.3.19/angular-animate.js',
  './src/vendor/angular-cookie-4.1.0/angular-cookie.js',
  './src/vendor/angular-ui-router-0.2.18/angular-ui-router.js',
  './src/vendor/ng-file-upload-12.0.4/ng-file-upload-all.js',
  './src/vendor/angular-img-cropper-1.0.0/angular-img-cropper.js',
  './src/vendor/custom-bootstrap-3.3.5/js/bootstrap.js',
  './src/vendor/moment-2.13.0/moment.js',
  './src/vendor/marked-0.3.5/marked.js',
  './src/vendor/bootstrap-markdown-2.10.0/js/bootstrap-markdown.js',
  './src/vendor/bootstrap-markdown-2.10.0/js/bootstrap-markdown.zh.js',
  './src/vendor/bootstrap-datepicker-1.6.1/js/bootstrap-datepicker.js',
  './src/vendor/bootstrap-datepicker-1.6.1/js/bootstrap-datepicker.zh-CN.js',
  './src/vendor/chart-2.7.0/Chart.js'
];

/**
 * 开发模式合并 vendor js
 */
gulp.task('concat-vendor-js', ['clean'], function () {
  return gulp.src(vendorSrcJS)
    .pipe(plumber({ errorHandler: error }))
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * 生产模式合并 vendor js
 */
gulp.task('concat-vendor-js-less', ['clean'], function () {
  return gulp.src(vendorSrcJS)
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * vendor css 源
 */
var vendorSrcCSS = [
  './src/vendor/font-awersome-4.6.1/font-awesome.css',
  './src/vendor/custom-bootstrap-3.3.5/css/bootstrap.css',
  './src/vendor/bootstrap-markdown-2.10.0/css/bootstrap-markdown.css',
  './src/vendor/bootstrap-markdown-2.10.0/css/bootstrap-markdown-rewrite.css',
  './src/vendor/bootstrap-datepicker-1.6.1/css/bootstrap-datepicker3.css'
];

/**
 * 开发模式合并 vendor css
 */
gulp.task('concat-vendor-css', ['clean'], function () {
  return gulp.src(vendorSrcCSS)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * 生产模式合并 vendor css
 */
gulp.task('concat-vendor-css-less', ['clean'], function () {
  return gulp.src(vendorSrcCSS)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(concat('vendor.css'))
    .pipe(minify())
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * 开发模式合并 admin js
 */
gulp.task('concat-admin-js', ['clean'], function () {
  return gulp.src(['./src/main.js', './src/controllers/*.js', './src/services/*.js', './src/directives/*.js', './src/filters/*.js'])
    .pipe(plumber({ errorHandler: error }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * 生产模式合并 admin js
 */
gulp.task('concat-admin-js-less', ['clean'], function () {
  return gulp.src(['./src/main.js', './src/controllers/*.js', './src/services/*.js', './src/directives/*.js', './src/filters/*.js'])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * 合并 admin views
 */
gulp.task('concat-admin-views', function () {
  return gulp.src('./src/views/*.html')
    .pipe(templateCache({
      module: 'views',
      filename: 'views.js'
    }))
    .pipe(gulp.dest('public/assets/'));
});

/**
 * 拷贝 src/ 到 public/assets/
 */
gulp.task('copy-admin-assets', ['clean'], function () {
  return gulp.src([
    './src/home.html',
    './src/images/**/*'
  ], { base: './src/' })
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * 拷贝 font-awersome fonts
 */
gulp.task('copy-admin-font-awersome-fonts', ['clean'], function () {
  return gulp.src('./src/vendor/font-awersome-4.6.1/fonts/*', { base: './src/vendor/font-awersome-4.6.1/' })
    .pipe(gulp.dest('./public/assets/'));
});

/**
 * 开发模式监视文件
 */
gulp.task('watch-assets-admin', function () {
  gulp.watch('./src/**/*', ['build-admin-assets', 'concat-vendor-js', 'concat-vendor-css', 'concat-admin-js', 'concat-admin-views', 'copy-admin-assets', 'copy-admin-font-awersome-fonts']);
});

/**
 * 默认开发模式编译
 */
gulp.task('default', ['watch-assets-admin', 'build-admin-assets', 'concat-vendor-js', 'concat-vendor-css', 'concat-admin-js', 'concat-admin-views', 'copy-admin-assets', 'copy-admin-font-awersome-fonts']);

/**
 * 生产模式编译
 */
gulp.task('build', ['build-admin-assets-less', 'concat-vendor-js-less', 'concat-vendor-css-less', 'concat-admin-js-less', 'concat-admin-views', 'copy-admin-assets', 'copy-admin-font-awersome-fonts']);