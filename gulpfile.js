'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    browserify = require('browserify'),
    source = require("vinyl-source-stream"),
    reactify = require('reactify'),
    react = require('gulp-react'),
    del = require('del');

var runSequence = require('run-sequence');

var path = {
    build: {
        base:'build',
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        data:'build/data'
    },
    dist: {
        tmp:{
            css: 'dist/tmp/css'
        },
        js: 'dist/js',
        css: 'dist/css',
        img: 'dist/img',
        dist: ['dist/js', 'dist/css', 'dist/img']
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/**/*.js',
        style:  'src/css/**/*.css',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        data: 'src/data/**/*.*',
        sass: 'src/sass/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/css/**/*.css',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        data: 'src/data/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    del(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});



var data = function () {
    gulp.src(path.src.data)
        .pipe(gulp.dest(path.build.data))
        .pipe(reload({stream: true}));
};

gulp.task('data:build', data);

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        //.pipe(browserify())
        //.pipe(reactify)
        .pipe(react())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('js:build-prod', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        //.pipe(browserify())
        //.pipe(reactify)
        .pipe(react())
        //.pipe(sourcemaps.init())
        .pipe(uglify())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});


gulp.task('sass:build', function(){
    return gulp.src(path.src.sass)
        .pipe(sass({
            sourceMap:true,
            errLogToConsole: true
        }))
        .pipe(gulp.dest(path.dist.tmp.css))
        .pipe(reload({stream:true}));
});

gulp.task("style2:build", function() {
    return gulp.src(path.dist.tmp.css)
        .pipe(prefixer({
            browsers: ['last 15 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.init())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});


gulp.task("style:build", function() {
    return gulp.src(path.src.style)
        .pipe(prefixer({
            browsers: ['last 15 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.init())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('dist:copy', function(){
    gulp.src(['dist/**/*.*','!dist/tmp/**/*.*'])
        .pipe(gulp.dest(path.build.base));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('imagescopy:build', function(){
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img));
});

gulp.task('pre-build', function(cb){
    runSequence('clean', 'build', cb);
})

gulp.task('build', [
    'data:build',
    'html:build',
    'js:build',
    'sass:build',
    'style2:build',
    'style:build',
    'fonts:build',
    'imagescopy:build',
    'dist:copy'
]);

gulp.task('build-prod', [
    'data:build',
    'html:build',
    'js:build-prod',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('imagescopy:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.data], function(event, cb) {
        gulp.start('data:build');
    });
});


gulp.task('default', ['pre-build', 'webserver', 'watch']);
gulp.task('prod', ['build-prod', 'webserver', 'watch']);
