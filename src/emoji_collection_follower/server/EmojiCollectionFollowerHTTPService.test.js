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
  , AccountHTTPClientFixture = require('src/account/server/AccountHTTPClientFixture').get_instance()

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe.only('EmojiCollectionFollowerHTTPService', function() {
    describe('post', function () {
        var ctx1 = {}
          , ctx2 = {}

        it('should work', function * () {
            yield AccountHTTPClientFixture.post({ctx: ctx1, fields: {account: 'account'}})
            yield AccountHTTPClientFixture.post({ctx: ctx2, fields: {account: 'account'}})
        })
    })
})
