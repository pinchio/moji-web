var assert = require('chai').assert
  , fs = require('fs')
  , server = require('src/server').Server.get_instance()
  , config = require('config')
  , port = config.get('server').port
  , host = '0.0.0.0'
  , request = require('request')
  , path = require('path')

var get_url = function(args) {
    return 'http://localhost:' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('EmojiCollectionHTTPService', function() {
    describe('post', function() {
        var username = 'ab' + Date.now()
          , password = 'password'
          , email = 'a' + Date.now() + '@b.com'
          , stored_account
          , stored_jar
    })
})
