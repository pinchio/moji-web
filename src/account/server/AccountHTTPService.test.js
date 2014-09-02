var assert = require('chai').assert
  , config = require('config')
  , host = config.get('server').host
  , path = require('path')
  , port = config.get('server').port
  , request = require('request')
  , uuid = require('node-uuid')

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
    var stored_account
      , stored_jar

    describe('post', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , profile_image_url = 'someurl.png'

        it('should create account if username and email unique', function(done) {
            stored_jar = request.jar()

            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                      , email: email
                      , profile_image_url: profile_image_url
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body, 'body should be defined')
                    assert.isObject(body, 'body is an object')
                    assert.isDefined(body.account, 'account should be defined')
                    assert.equal(body.account.username, username, 'username should match')
                    assert.equal(body.account.email, email, 'email should match')
                    assert.isUndefined(body.account.password, 'password should not be defined')
                    assert.equal(body.account.profile_image_url, profile_image_url)

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

        it('should create account if without born_at if born_at not set', function(done) {
            var username = Math.floor(Math.random() * 1000000000)
              , password = 'password'
              , email = uuid.v4().substring(0, 15) + '@b.com'
              , stored_jar = request.jar()

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
                    assert.equal(d.statusCode, 200)
                    assert.equal(body.account.born_at, null)
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
                    assert.equal(body.description, 'Password must be between 6 and 50 characters.')
                    done()
            })
        })

        it('should not allow short passwords', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: '12345'
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Password must be between 6 and 50 characters.')
                    done()
            })
        })

        it('should not allow long passwords', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: (Array(52)).join('a')
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Password must be between 6 and 50 characters.')
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

        it('should not allow bad profile_image_urls', function(done) {
            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                      , email: 'a@b.com'
                      , profile_image_url: 'bad.exe'
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.type, 'bad_request')
                    assert.equal(body.description, 'Profile image url extension not supported.')
                    done()
            })
        })
    })

    describe('put', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , profile_image_url = 'someurl.png'
          , stored_jar = request.jar()

        it('should create account if username and email unique', function(done) {

            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                      , email: email
                      , profile_image_url: profile_image_url
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    stored_account = body.account
                    done()
            })
        })

        it('should not allow update if not logged in', function(done) {
            request({
                    url: get_url('/_/api/account/' + stored_account.id)
                  , method: 'PUT'
                  , json: {
                        username: username
                      , password: password
                      , email: email
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 401)
                    done()
            })
        })

        it('should not allow update if account id does not exist', function(done) {
            request({
                    url: get_url('/_/api/account/' + uuid.v4())
                  , method: 'PUT'
                  , json: {
                        username: username
                      , password: password
                      , email: email
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 404)
                    done()
            })
        })

        it('should allow update', function(done) {
            request({
                    url: get_url('/_/api/account/' + stored_account.id)
                  , method: 'PUT'
                  , json: {
                        username: username
                      , password: 'somenewpassword'
                      , email: email
                      , full_name: 'I has a name now'
                      , profile_image_url: 'Some_newurl.png'
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.notEqual(body.account.full_name, stored_account.full_name)
                    assert.notEqual(body.account.profile_image_url, stored_account.profile_image_url)
                    done()
            })
        })
    })

    describe('get', function() {
        var stored_jar = request.jar()
          , stored_account

        it('should create account', function(done) {
            var username = Math.floor(Math.random() * 1000000000)
              , password = 'password'
              , email = uuid.v4().substring(0, 15) + '@b.com'

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
                    assert.equal(d.statusCode, 200)
                    stored_account = body.account
                    done()
            })
        })

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
                    assert.deepEqual(body.account, stored_account)
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

    describe('@mojigram user', function() {
        it('should not create @mojigram user because username already exists.', function(done) {
            stored_jar = request.jar()

            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: 'mojigram'
                      , password: 'somepassword'
                      , email: 'mojigram@gmail.com'
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 409)
                    done()
            })
        })

        it('should not create @mojigram user because email already exists.', function(done) {
            stored_jar = request.jar()

            request({
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: Math.floor(Math.random() * 1000000000)
                      , password: 'somepassword'
                      , email: 'mojigram@gmail.com'
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 409)
                    done()
            })
        })
    })
})