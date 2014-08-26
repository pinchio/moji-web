var fs = require('fs')
  , _ = require('underscore')
  , path = require('path')
  , CommonLocalService = require('src/common/server/CommonLocalService').get_instance()
  , StaticMixin = require('src/common/StaticMixin')

var HomeLocalService = function HomeLocalService() {
    this.ns = 'HomeLocalService'
}
_.extend(HomeLocalService, StaticMixin)

// TODO: rename css to styles or scripts to js
HomeLocalService.prototype.get_page = function * (req) {
    // console.log(path.join(process.env.PROJECT_PATH, './public/_/css/all.css'), 'utf8')

    // if (config.env === 'development') {
    //     var css = fs.readFileSync(path.join(process.env.PROJECT_PATH, './public/_/css/all.css'), 'utf8')
    // } else {
    //     var css = fs.readFileSync(path.join(process.env.PROJECT_PATH, './public/_/css/all.min.css'), 'utf8')
    // }

    var base = fs.readFileSync(path.join(process.env.NODE_PATH, './src/layout/base.html'), 'utf8')
      , modernizr = fs.readFileSync(path.join(process.env.NODE_PATH, './node_modules/Modernizr/modernizr.js'), 'utf8')
      , head_js = modernizr

    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
        var head_css_files = [
            '/_/css/all.min.css'
        ]

        var body_js_files = [
            '/_/scripts/vendor.min.js'
          , '/_/scripts/main.min.js'
        ]
    } else if (process.env.NODE_ENV === 'development') {
        var head_css_files = [
            '/_/css/all.css'
        ]

        var body_js_files = [
            '/_/scripts/vendor.min.js'
          , '/_/scripts/main.js'
        ]
    }

    head_css_files = head_css_files.map(function(file) {
        return file + '?h=' + CommonLocalService.get_file_hash(file)
    })

    body_js_files = body_js_files.map(function(file) {
        return file + '?h=' + CommonLocalService.get_file_hash(file)
    })

    var layouts = {
        base: _.template(base, {
            head_js: head_js
          , head_css_files: head_css_files
          , body_js_files: body_js_files
        })
    }

    var base = layouts.base
    return base
}

module.exports = HomeLocalService
