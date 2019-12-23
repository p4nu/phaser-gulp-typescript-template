const gulp = require('gulp');
const { series } = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const watchify = require('watchify');
const fancy_log = require('fancy-log');
const uglify = require('gulp-uglify');
const sourceMaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const connect = require('gulp-connect');

const paths = {
    pages: ['src/*.html'],
};

const watchedBrowserify = watchify(browserify({
    basedir: '.',
    debug: true,
    entries: ['src/main.ts'],
    cache: {},
    packageCache: {},
})
    .plugin(tsify)
    .transform('babelify', {
        presets: [
            '@babel/preset-env',  
        ],
        extensions: ['.ts'],
    }));

function copyHtml(cb) {
    gulp.src(paths.pages)
        .pipe(gulp.dest('dist'));
    cb();
}

function bundlify(cb) {
    bundle();
    cb();
}

function bundle() {
    watchedBrowserify
        .bundle()
        .on('error', fancy_log)
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourceMaps.write('./'))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
}

function connectify(cb) {
    connect.server({
        port: 8080,
        root: 'dist',
    });
    cb();
}

watchedBrowserify.on('update', bundle);
watchedBrowserify.on('log', fancy_log);

exports.default = series(copyHtml, bundlify, connectify);
