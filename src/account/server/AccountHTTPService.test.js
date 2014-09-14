var _ = require('underscore')
  , assert = require('chai').assert
  , co_mocha = require('co-mocha')
  , uuid = require('node-uuid')
  , AccountHTTPClient = require('src/account/server/AccountHTTPClient').get_instance()
  , AccountHTTPClientFixture = require('src/account/server/AccountHTTPClientFixture').get_instance()
  , AccountPersistenceService = require('src/account/server/AccountPersistenceService').get_instance()
  , Context = require('src/common/server/Context')

describe.only('AccountHTTPService', function() {
    describe('post', function() {
        beforeEach(function * () {
            // TODO: kind of hacky.
            var old_console_log = console.log
            console.log = function() {}
            yield AccountPersistenceService.delete_dangerous()
            console.log = old_console_log
        })

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

        it('should create account if username and fb_id unique', function * () {
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
        it('should not allow update if not logged in', function * () {
            var ctx = new Context()
              , ctx2 = new Context()
              , created_account = yield AccountHTTPClientFixture.post({ctx: ctx})
              , updated_account = yield AccountHTTPClientFixture.put({
                    ctx: ctx2
                  , id: created_account.body.account.id
                  , body: _.extend(created_account.body.account, {
                        foo: 'bar'
                    })
                })

            assert.equal(updated_account.statusCode, 401)
        })

        it('should not allow update if account id does not exist', function * () {
            var ctx = new Context()
              , created_account = yield AccountHTTPClientFixture.post({ctx: ctx})
              , updated_account = yield AccountHTTPClientFixture.put({
                    ctx: ctx
                  , id: uuid.v4()
                  , body: _.extend(created_account.body.account, {
                        password: created_account.req_body.password
                    })
                })


            assert.equal(updated_account.statusCode, 404)
        })

        it('should allow update', function * () {
            var ctx = new Context()
              , created_account = yield AccountHTTPClientFixture.post({ctx: ctx})
              , updated_account = yield AccountHTTPClientFixture.put({
                    ctx: ctx
                  , id: created_account.body.account.id
                  , body: _.extend(created_account.body.account, {
                        password: created_account.req_body.password
                      , full_name: 'I has a better name now'
                    })
                })

            assert.equal(updated_account.statusCode, 200)
            assert.equal(updated_account.body.account.full_name, updated_account.req_body.full_name)
        })
    })

    describe('get', function() {
        it('should get account even if not authd', function * () {
            var ctx = new Context()
              , ctx2 = new Context()
              , created_account = yield AccountHTTPClientFixture.post({ctx: ctx})
              , get_account = yield AccountHTTPClientFixture.get({ctx: ctx2, id: created_account.body.account.id})

            assert.equal(get_account.statusCode, 200)
            assert.equal(get_account.body.account.id, created_account.body.account.id)
            assert.isUndefined(get_account.body.account.email)
        })

        it('should get privileged account if authd', function * () {
            var ctx = new Context()
              , created_account = yield AccountHTTPClientFixture.post({ctx: ctx})
              , get_account = yield AccountHTTPClientFixture.get({ctx: ctx, id: created_account.body.account.id})

            assert.equal(get_account.statusCode, 200)
            assert.deepEqual(get_account.body.account, created_account.body.account)
        })

        it('should get 404 if id not valid', function * () {
            var ctx = new Context()
              , get_account = yield AccountHTTPClientFixture.get({ctx: ctx, id: uuid.v4()})

            assert.equal(get_account.statusCode, 404)
        })
    })

    describe('@mojigram user', function() {
        before(function * () {
            // TODO: kind of hacky.
            var old_console_log = console.log
            console.log = function() {}
            yield AccountPersistenceService.delete_dangerous()
            yield AccountPersistenceService.insert_mojigram()
            console.log = old_console_log
        })

        it('should not create @mojigram user because username already exists.', function * () {
            var ctx = new Context()
              , created_account = yield AccountHTTPClientFixture.post({
                    ctx: ctx
                  , body: {
                        username: 'mojigram'
                      , password: 'somepasword'
                      , email: 'mojigram@gmail.com'
                    }
                })

            assert.equal(created_account.statusCode, 409)
            assert.equal(created_account.body.description, 'Username is taken.')
        })

        it('should not create @mojigram user because email already exists.', function * () {
            var ctx = new Context()
              , created_account = yield AccountHTTPClientFixture.post({
                    ctx: ctx
                  , body: {
                        password: 'somepasword'
                      , email: 'mojigram@gmail.com'
                    }
                })

            assert.equal(created_account.statusCode, 409)
            assert.equal(created_account.body.description, 'Email is taken.')
        })
    })
})
