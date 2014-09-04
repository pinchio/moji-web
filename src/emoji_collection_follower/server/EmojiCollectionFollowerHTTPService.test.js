var assert = require('chai').assert
  , co = require('co')
  , co_mocha = require('co-mocha')
  , config = require('config')
  , fs = require('fs')
  , host = config.get('server').host
  , path = require('path')
  , port = config.get('server').port
  , request = require('request')
  , uuid = require('node-uuid')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('EmojiCollectionFollowerHTTPService', function() {
    describe('post', function () {
    })
})
