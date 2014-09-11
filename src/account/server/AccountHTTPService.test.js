var assert = require('chai').assert
  , co_mocha = require('co-mocha')
  , config = require('config')
  , host = config.get('server').host
  , path = require('path')
  , port = config.get('server').port
  , request = require('request')
  , uuid = require('node-uuid')
  , AccountHTTPClient = require('src/account/server/AccountHTTPClient').get_instance()
  , AccountHTTPClientFixture = require('src/account/server/AccountHTTPClientFixture').get_instance()
  , Context = require('src/common/server/Context')

describe('AccountHTTPService', function() {
    describe.only('post', function() {
        it('should create account if username and email unique', function * () {
            var ctx = new Context()
              , result = yield AccountHTTPClientFixture.post({ctx: ctx})

            assert.equal(result.statusCode, 200)
            assert.isDefined(result.body)
            assert.isObject(result.body)
            assert.isDefined(result.body.account)
            assert.equal(result.body.account.username, result.req_body.username)
            assert.equal(result.body.account.email, result.req_body.email)
            assert.isUndefined(result.body.account.password)
            assert.equal(result.body.account.profile_image_url, result.req_body.profile_image_url)

            var cookies = ctx.jar.getCookieString(AccountHTTPClient.get_url())
              , cookie_map = {}

            cookies.split('; ').forEach(function(cookie) {
                var key_value = cookie.split('=')

                cookie_map[key_value[0]] = key_value[1]
            })

            assert.isDefined(cookie_map['koa:sess'])
            assert.isDefined(cookie_map['koa:sess.sig'])
        })

        it.skip('should create account if username and fb_id unique', function * () {
            var ctx = new Context()
              , result = yield AccountHTTPClientFixture.post_by_fb_access_token({ctx: ctx})

            assert.equal(result.statusCode, 200)
            assert.isDefined(result.body)
            assert.isObject(result.body)
            assert.isDefined(result.body.account)
            assert.equal(result.body.account.username, result.req_body.username)
            assert.equal(result.body.account.email, result.req_body.email)
            assert.isUndefined(result.body.account.password)
            assert.equal(result.body.account.profile_image_url, result.req_body.profile_image_url)

            var cookies = ctx.jar.getCookieString(AccountHTTPClient.get_url())
              , cookie_map = {}

            cookies.split('; ').forEach(function(cookie) {
                var key_value = cookie.split('=')

                cookie_map[key_value[0]] = key_value[1]
            })

            assert.isDefined(cookie_map['koa:sess'])
            assert.isDefined(cookie_map['koa:sess.sig'])
        })

        it('should create account if without born_at if born_at not set', function * () {
            var ctx = new Context()
              , result = yield AccountHTTPClientFixture.post({ctx: ctx, body: {born_at: null}})

            assert.equal(result.statusCode, 200)
            assert.equal(result.body.account.born_at, null)
        })

        it('should not allow duplicate username', function * () {
            var ctx = new Context()
              , result = yield AccountHTTPClientFixture.post({ctx: ctx})
              , result2 = yield AccountHTTPClientFixture.post({ctx: ctx, body: {username: result.req_body.username}})

            assert.equal(result2.statusCode, 409)
            assert.equal(result2.body.type, 'conflict')
            assert.equal(result2.body.description, 'Username is taken.')
        })

        it('should not allow duplicate email', function * () {
            var ctx = new Context()
              , result = yield AccountHTTPClientFixture.post({ctx: ctx})
              , result2 = yield AccountHTTPClientFixture.post({ctx: ctx, body: {email: result.req_body.email}})

            assert.equal(result2.statusCode, 409)
            assert.equal(result2.body.type, 'conflict')
            assert.equal(result2.body.description, 'Email is taken.')
        })

        it('should not allow empty usernames', function * () {
            var ctx = new Context()
              , result = yield AccountHTTPClientFixture.post({ctx: ctx, body: {username: null}})

            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Username must be between 3 and 15 characters.')
        })

        it('should not allow short usernames', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {username: 'a'}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Username must be between 3 and 15 characters.')
        })

        it('should not allow long usernames', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {username: '1234567890123456'}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Username must be between 3 and 15 characters.')
        })

        it('should not allow non-alphanumeric characters in username', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {username: '___'}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Username can only contain letters and numbers.')
        })

        it('should not allow empty passwords', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {password: null}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Password must be between 6 and 50 characters.')
        })

        it('should not allow short passwords', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {password: '12345'}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Password must be between 6 and 50 characters.')
        })

        it('should not allow long passwords', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {password: (Array(52)).join('a')}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Password must be between 6 and 50 characters.')
        })

        it('should not allow non-alphanumeric characters in password', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {password: '12345670__'}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Password can only contain letters and numbers.')
        })

        it('should not allow empty emails', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {email: null}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Email is not valid.')
        })

        it('should not allow invalid emails', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {email: 'a@b'}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Email is not valid.')
        })

        it('should not allow invalid emails', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {email: '@b.com'}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Email is not valid.')
        })

        it('should not allow bad profile_image_urls', function * () {
            var result = yield AccountHTTPClientFixture.post({ctx: new Context(), body: {profile_image_url: 'bad.exe'}})
            assert.equal(result.statusCode, 400)
            assert.equal(result.body.type, 'bad_request')
            assert.equal(result.body.description, 'Profile image url extension not supported.')
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