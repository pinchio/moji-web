var assert = require('chai').assert
  , co_mocha = require('co-mocha')
  , config = require('config')
  , host = config.get('server').host
  , port = config.get('server').port
  , request = require('request')
  , path = require('path')
  , uuid = require('node-uuid')
  , fs = require('fs')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('FeaturedHTTPService', function() {
})
