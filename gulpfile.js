var fs = require('fs')
  , crypto = require('crypto')
  , browserify = require('browserify')
  , gulp = require('gulp')
  , gulp_buffer = require('gulp-buffer')
  , gulp_if = require('gulp-if')
  , gulp_less = require('gulp-less')
  , gulp_rename = require('gulp-rename')
  , gulp_shell = require('gulp-shell')
  , gulp_spritesmith = require('gulp.spritesmith')
  , gulp_uglify = require('gulp-uglify')
  , gulp_watch = require('gulp-watch')
  , config = require('./config')
  , path = require('path')
  , vinyl_source_stream = require('vinyl-source-stream')
  , file = require('file')
  , _ = require('underscore')

  // , gulp_browserify = require('gulp-browserify')
  // , gulp_clean = require('gulp-clean')
  // , gulp_concat = require('gulp-concat')
  // , gulp_imagemin = require('gulp-imagemin')
  // , gulp_jshint = require('gulp-jshint')
  // , gulp_util = require('gulp-util')
  // , watchify = require('watchify')

// TODO: move stuff in deploy into src
// TODO: when changing base.html should restart server
// TODO: all .min should be separate rules.
// TODO: remove underscore dep

// TODO: Get news jobs up.

var paths = {
    scripts: ['src/**/*.js', '!src/**/server/*.js']
  , server_scripts: ['src/**/server/*.js']
  , styles: ['src/*/*.less', 'src/*/*.css', 'src/*/.spriterc', '!src/*/sprite.less']
  , images: ['src/**/*.png']
  , tests: ['src/*/*.test.js']
}

gulp.task('sprite', function() {
    var sprite_data = gulp.src('src/asset/**/*.png').pipe(gulp_spritesmith({
        imgName: 'sprite_2x.png'
      , cssName: 'sprite.less'
      , engine: 'pngsmith'
      , padding: 2
      , cssTemplate: './src/asset/.spriterc'
      , imgOpts: {
            format: 'png'
          , quality: 100
        }
      , algorithm: 'binary-tree'
      , cssOpts: {
            img_path: '/_/asset/sprite_2x.png'
        }
    }))

    sprite_data.img.pipe(gulp.dest('public/_/asset/'))
    return sprite_data.css.pipe(gulp.dest('src/asset/'))
})

var less = function() {
    return gulp.src('./src/common/all.less')
        .pipe(gulp_less({}))
        .pipe(gulp.dest('./public/_/css'))
}

gulp.task('less:compile', less)
gulp.task('less', ['sprite'], less)

gulp.task('less:min', function() {
    return gulp.src('./src/common/all.less')
        .pipe(gulp_less({compress: true}))
        .pipe(gulp_rename(function(path) {
            path.extname = ".min.css"
        }))
        .pipe(gulp.dest('./public/_/css'))
})

gulp.task('fontawesome', function() {
    return gulp.src('./node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('./public/_/font'))
})

gulp.task('main', function() {
    // The require('react') is to bundle react globally for react developer tools.
    // Doesn't look like to be affecting anything adversely.
    return browserify('./src/common/main.js')
        .transform('reactify')
        .external('jquery')
        .external('velocity-animate')
        .external('react')
        .external('react/addons')
        .external('underscore')
        .external('backbone')
        .external('hammerjs')
        .bundle({
            debug: (config.get('env') === 'development')
        })
        .pipe(vinyl_source_stream('main.js'))
        .pipe(gulp.dest('./public/_/scripts'))
})

gulp.task('main:min', ['main'], function() {
    return gulp.src('./public/_/scripts/main.js')
        .pipe(gulp_uglify({outSourceMap: false}))
        .pipe(gulp_rename(function(path) {
            path.extname = ".min.js"
        }))
        .pipe(gulp.dest('./public/_/scripts'))
})

gulp.task('vendor', function() {
    // The require('react') is to bundle react globally for react developer tools.
    return browserify('./src/common/vendor.js')
        .require('jquery')
        .require('velocity-animate')
        .require('react')
        .require('react/addons')
        .require('underscore')
        .require('hammerjs')
        .require('fastclick')
        .require('cortexjs')
        .bundle({
            // debug: (config.get('env') === 'development')
        })
        .pipe(vinyl_source_stream('vendor.js'))
        .pipe(gulp.dest('./public/_/scripts'))
})

gulp.task('vendor:min', ['vendor'], function() {
    return gulp.src('./public/_/scripts/vendor.js')
        .pipe(gulp_uglify({outSourceMap: false}))
        .pipe(gulp_rename(function(path) {
            path.extname = ".min.js"
        }))
        .pipe(gulp.dest('./public/_/scripts'))
})

gulp.task('pm2:restart', function() {
    return gulp.src('').pipe(gulp_shell('pm2 restart all'))
})

// //TODO: restart, reload or gracefulReload?
// This is a sort of hack to get LiveReload to reload browser.
gulp.task('server:restart', ['pm2:restart'], function() {
    return gulp.run('main')
})

gulp.task('watch', function() {
    gulp_watch({glob: paths.styles}, function(files) {
        gulp.run('less:compile')
    })

    gulp_watch({glob: paths.server_scripts}, function(files) {
        gulp.run('server:restart')
    })

    gulp_watch({glob: paths.scripts}, function(files) {
        gulp.run('main')
    })

    gulp_watch({glob: paths.images}, function(files) {
        gulp.run('less')
    })
})

gulp.task('file_hashes', ['vendor:min', 'main:min', 'less:min'], function() {
    // For every file in public folder generate the sha1 code.
    var all_files = []

    file.walkSync('./public/_', function(dir_path, dirs, files) {
        files = files.map(function(file) {return path.join(dir_path, file)})
        all_files = all_files.concat(files)
    })

    var file_hashes = all_files.filter(function(file_name) {
        return file_name.indexOf('file_hashes.json') == -1
    }).map(function(file_name) {
        var file_data = fs.readFileSync(file_name)
          , hash = crypto.createHash('sha1').update(file_data).digest('hex')
          , prefix_length = 'public'.length

        return {
            file: file_name.substring(prefix_length)
          , hash: hash
        }
    })

    fs.writeFileSync('./public/_/file_hashes.json', JSON.stringify(file_hashes, 4, 4), 'utf8')
})

gulp.task('test', function() {
    // Mocha glob is kinda weird.
    return gulp.src('').pipe(gulp_shell('mocha --harmony --reporter spec src/*/*.test.js src/*/*/*.test.js'))
})

gulp.task('test:watch', function() {
    gulp_watch({glob: paths.server_scripts}, function(files) {
        gulp.run('test')
    })

    gulp_watch({glob: paths.scripts}, function(files) {
        gulp.run('test')
    })

    gulp_watch({glob: paths.tests}, function(files) {
        gulp.run('test')
    })
})


gulp.task('build', ['main', 'less', 'fontawesome'])

gulp.task('default', ['build'])

gulp.task('precommit', ['file_hashes', 'vendor:min', 'main:min', 'less:min'])
