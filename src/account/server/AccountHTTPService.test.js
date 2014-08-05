var assert = require('chai').assert
  , server = require('src/server').Server.get_instance()
  , config = require('config')
  , port = config.get('server').port
  , host = '0.0.0.0'
  , request = require('request')
  , path = require('path')

var get_url = function(args) {
    return 'http://localhost:' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('AccountHTTPService', function() {
    // before(function() {
    //     server.listen(port, host)
    // })

    // after(function() {
    //     server.close()
    // })
    var username = '__' + Date.now()
      , password = 'password'

    describe('post', function() {
        it('should create account if unique', function(done) {
            this.timeout(10000)
            request(
                {
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                    }
                }
              , function(e, d, body) {
                    assert.isDefined(body, 'body should be defined')
                    assert.isObject(body, 'body is an object')
                    assert.isDefined(body.account, 'account should be defined')
                    assert.equal(body.account.username, username, 'username should match')
                    assert.isUndefined(body.account.password, 'password should not be defined')
                    done()
                })
        })
    })
})