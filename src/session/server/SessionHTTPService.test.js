var assert = require('chai').assert
  , server = require('src/server').Server.get_instance()
  , config = require('config')
  , port = config.get('server').port
  , host = '0.0.0.0'
  , request = require('request')
  , path = require('path')
  // , tough_cookie = require('tough-cookie')
  // , Cookie = tough_cookie.Cookie
  // , CookieJar = tough_cookie.CookieJar

var get_url = function(args) {
    return 'http://localhost:' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('SessionHTTPService', function() {
    describe('post', function() {
        var username = 'ab' + Date.now()
          , password = 'password'
          , email = 'a' + Date.now() + '@b.com'
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
                    assert.lengthOf(cookies, 0)
                    done()
                }
            )
        })
    })

    describe('del', function() {
        var username = 'ab' + Date.now()
          , password = 'password'
          , email = 'a' + Date.now() + '@b.com'
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
                            assert.lengthOf(cookies, 0)
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
                            assert.lengthOf(cookies, 0)

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
                                    assert.lengthOf(cookies, 0)
                                    done()
                                }
                            )
                        }
                    )
                }
            )
        })

        // it should delete if session not exist
    })
})