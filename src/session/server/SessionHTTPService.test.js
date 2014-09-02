var assert = require('chai').assert
  , config = require('config')
  , host = config.get('server').host
  , port = config.get('server').port
  , request = require('request')
  , path = require('path')
  , uuid = require('node-uuid')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('SessionHTTPService', function() {
    describe('post', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_account
          , stored_jar

        it('should create session if login correct', function(done) {
            stored_jar = request.jar()

            request(
                {
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
                    stored_account = body.account

                    request(
                        {
                            url: get_url('/_/api/session')
                          , method: 'POST'
                          , json: {
                                username: username
                              , password: password
                            }
                          , jar: stored_jar
                        }
                      , function(e, d, body) {
                            assert.equal(d.statusCode, 200)
                            assert.isDefined(body.account)
                            assert.equal(body.account.username, username)
                            assert.equal(body.account.email, email)

                            var cookies = stored_jar.getCookieString(get_url())
                              , cookie_map = {}

                            cookies.split('; ').forEach(function(cookie) {
                                var key_value = cookie.split('=')

                                cookie_map[key_value[0]] = key_value[1]
                            })

                            assert.isDefined(cookie_map['koa:sess'])
                            assert.isDefined(cookie_map['koa:sess.sig'])
                            done()
                        }
                    )
                }
            )
        })

        it('should not create session if login incorrect', function(done) {
            stored_jar = request.jar()

            request(
                {
                    url: get_url('/_/api/session')
                  , method: 'POST'
                  , json: {
                        username: 'badusername'
                      , password: password
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    var cookies = stored_jar.getCookieString(get_url())

                    assert.equal(d.statusCode, 403)
                    assert.lengthOf(cookies, 0)
                    done()
                }
            )
        })

        it('should not create session if login incorrect', function(done) {
            stored_jar = request.jar()

            request(
                {
                    url: get_url('/_/api/session')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: 'badpassword'
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    var cookies = stored_jar.getCookieString(get_url())

                    assert.equal(d.statusCode, 403)
                    done()
                }
            )
        })
    })

    describe('del', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_account
          , stored_jar

        it('should delete session if session exists', function(done) {
            stored_jar = request.jar()

            request(
                {
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
                    stored_account = body.account

                    request(
                        {
                            url: get_url('/_/api/session')
                          , method: 'DELETE'
                          , json: {}
                          , jar: stored_jar
                        }
                      , function(e, d, body) {
                            var cookies = stored_jar.getCookieString(get_url())

                            assert.equal(d.statusCode, 200)
                            assert.equal(cookies.indexOf('koa:sess=;') > -1, true)
                            done()
                        }
                    )
                }
            )
        })

        it('should delete session if session does not exist', function(done) {
            stored_jar = request.jar()

            request(
                {
                    url: get_url('/_/api/session')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    var cookies = stored_jar.getCookieString(get_url())
                    assert.equal(cookies.indexOf('koa:sess=;') > -1, false)
                    stored_account = body.account

                    request(
                        {
                            url: get_url('/_/api/session')
                          , method: 'DELETE'
                          , json: {}
                          , jar: stored_jar
                        }
                      , function(e, d, body) {
                            var cookies = stored_jar.getCookieString(get_url())

                            assert.equal(d.statusCode, 200)
                            assert.equal(cookies.indexOf('koa:sess=;') > -1, true)

                            request(
                                {
                                    url: get_url('/_/api/session')
                                  , method: 'DELETE'
                                  , json: {}
                                  , jar: stored_jar
                                }
                              , function(e, d, body) {
                                    var cookies = stored_jar.getCookieString(get_url())

                                    assert.equal(d.statusCode, 200)
                                    assert.equal(cookies.indexOf('koa:sess=;') > -1, true)
                                    done()
                                }
                            )
                        }
                    )
                }
            )
        })
    })
})