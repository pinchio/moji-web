var assert = require('chai').assert
  , server = require('src/server').Server.get_instance()
  , config = require('config')
  , host = config.get('server').host
  , port = config.get('server').port
  , request = require('request')
  , path = require('path')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('AccountHTTPService', function() {
    // before(function() {
    //     server.listen(port, host)
    // })

    // after(function() {
    //     server.close()
    // })
    var username = 'ab' + Date.now()
      , password = 'password'
      , email = 'a' + Date.now() + '@b.com'
      , stored_account
      , stored_jar

    describe('post', function() {
        it('should create account if username and email unique', function(done) {
            stored_jar = request.jar()
            // var cookie = request.cookie('a=b')
            // stored_jar.setCookie(cookie, 'www.mojigram.com')

            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                      , email: email
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.isDefined(body, 'body should be defined')
                    assert.isObject(body, 'body is an object')
                    assert.isDefined(body.account, 'account should be defined')
                    assert.equal(body.account.username, username, 'username should match')
                    assert.equal(body.account.email, email, 'email should match')
                    assert.isUndefined(body.account.password, 'password should not be defined')

                    var cookies = stored_jar.getCookieString(get_url())
                      , cookie_map = {}

                    cookies.split('; ').forEach(function(cookie) {
                        var key_value = cookie.split('=')

                        cookie_map[key_value[0]] = key_value[1]
                    })

                    assert.isDefined(cookie_map['koa:sess'])
                    assert.isDefined(cookie_map['koa:sess.sig'])

                    stored_account = body.account
                    done()
            })
        })

        it('should not allow duplicate username', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                      , email: email
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 409)
                    assert.equal(body.type, 'conflict')
                    assert.equal(body.description, 'Username is taken.')
                    done()
            })
        })

        it('should not allow duplicate email', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: 'ab' + Date.now()
                      , password: password
                      , email: email
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 409)
                    assert.equal(body.type, 'conflict')
                    assert.equal(body.description, 'Email is taken.')
                    done()
            })
        })

        it('should not allow empty usernames', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: null
                      , password: password
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Username must be between 3 and 15 characters.')
                    done()
            })
        })

        it('should not allow short usernames', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: 'a'
                      , password: password
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Username must be between 3 and 15 characters.')
                    done()
            })
        })

        it('should not allow long usernames', function(done) {
            // Date.now() is 13 chars.
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: '1234567890123456'
                      , password: password
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Username must be between 3 and 15 characters.')
                    done()
            })
        })

        it('should not allow non-alphanumeric characters in username', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: '___'
                      , password: password
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Username can only contain letters and numbers.')
                    done()
            })
        })

        it('should not allow empty passwords', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: null
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Password must be between 8 and 32 characters.')
                    done()
            })
        })

        it('should not allow short passwords', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: '1234567'
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Password must be between 8 and 32 characters.')
                    done()
            })
        })

        it('should not allow long passwords', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: '123456789012345678901234567890123'
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Password must be between 8 and 32 characters.')
                    done()
            })
        })

        it('should not allow non-alphanumeric characters in password', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: '12345670__'
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Password can only contain letters and numbers.')
                    done()
            })
        })

        it('should not allow empty emails', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                      , email: null
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Email is not valid.')
                    done()
            })
        })

        it('should not allow invalid emails', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                      , email: 'a@b'
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Email is not valid.')
                    done()
            })
        })

        it('should not allow invalid emails', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                      , email: '@b.com'
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Email is not valid.')
                    done()
            })
        })
    })

    describe('get', function() {
        it('should get account even if not authd', function(done) {
            request({
                    url: get_url('/_/api/account/' + stored_account.id)
                  , method: 'GET'
                  , json: true
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.equal(body.account.id, stored_account.id)
                    assert.isUndefined(body.account.email)
                    done()
            })
        })

        it('should get privileged account if authd', function(done) {
            request({
                    url: get_url('/_/api/account/' + stored_account.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.equal(body.account.id, stored_account.id)
                    assert.isDefined(body.account.email)
                    done()
            })
        })

        it('should get 404 if id not valid', function(done) {
            request({
                    url: get_url('/_/api/account/' + 'some_invalid_id')
                  , method: 'GET'
                  , json: true
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 404)
                    done()
            })
        })
    })
})