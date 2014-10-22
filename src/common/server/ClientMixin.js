var config = require('config')
  , path = require('path')
  , request = require('request')
  , thunkify = require('thunkify')

var ClientMixin = function() {}

ClientMixin.prototype.get_url = function() {
    return 'http://' + config.get('server').host + ':' + config.get('server').port
         + path.join.apply(path, Array.prototype.slice.call(arguments))
}

ClientMixin.prototype.request = thunkify(request)

module.exports = ClientMixin
