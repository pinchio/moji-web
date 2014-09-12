var assert = require('chai').assert
  , AccountHTTPClient = require('src/account/server/AccountHTTPClient').get_instance()
  , AccountHTTPClientFixture = require('src/account/server/AccountHTTPClientFixture').get_instance()
  , AccountPersistenceService = require('src/account/server/AccountPersistenceService').get_instance()
  , Context = require('src/common/server/Context')
  , SessionHTTPClient = require('src/session/server/SessionHTTPClient').get_instance()
  , SessionHTTPClientFixture = require('src/session/server/SessionHTTPClientFixture').get_instance()

describe.only('SessionHTTPService', function() {
    beforeEach(function * () {
        var old_console_log = console.log
        console.log = function() {}
        yield AccountPersistenceService.delete_dangerous()
        console.log = old_console_log
    })

    describe('post', function() {
        it('should create session if login correct', function * () {
            var ctx = new Context()
              , ctx2 = new Context()
              , account_result = yield AccountHTTPClientFixture.post({ctx: ctx})
              , result = yield SessionHTTPClientFixture.post({
                    ctx: ctx2
                  , body: {
                        username: account_result.req_body.username
                      , password: account_result.req_body.password
                    }
                })

            assert.equal(result.statusCode, 200)
            assert.isDefined(result.body.account)
            assert.equal(result.body.account.username, account_result.req_body.username)
            assert.equal(result.body.account.email, account_result.req_body.email)

            var cookies = ctx2.jar.getCookieString(SessionHTTPClient.get_url())
              , cookie_map = {}

            cookies.split('; ').forEach(function(cookie) {
                var key_value = cookie.split('=')

                cookie_map[key_value[0]] = key_value[1]
            })

            assert.isDefined(cookie_map['koa:sess'])
            assert.isDefined(cookie_map['koa:sess.sig'])
        })

        it('should not create session if login incorrect', function * () {
            var ctx = new Context()
              , ctx2 = new Context()
              , account_result = yield AccountHTTPClientFixture.post({ctx: ctx})
              , result = yield SessionHTTPClientFixture.post({
                    ctx: ctx2
                  , body: {
                        username: 'badusername'
                      , password: account_result.req_body.password
                    }
                })

            assert.equal(result.statusCode, 403)
            assert.lengthOf(ctx2.jar.getCookieString(AccountHTTPClient.get_url()), 0)
        })

        it('should not create session if login incorrect', function * () {
            var ctx = new Context()
              , ctx2 = new Context()
              , account_result = yield AccountHTTPClientFixture.post({ctx: ctx})
              , result = yield SessionHTTPClientFixture.post({
                    ctx: ctx2
                  , body: {
                        username: account_result.req_body.password
                      , password: 'badpassword'
                    }
                })

            assert.equal(result.statusCode, 403)
            assert.lengthOf(ctx2.jar.getCookieString(AccountHTTPClient.get_url()), 0)
        })
    })

    describe('del', function() {
        it('should delete session if session exists', function * () {
            var ctx = new Context()
              , account_result = yield AccountHTTPClientFixture.post({ctx: ctx})
              , result = yield SessionHTTPClientFixture.del({ctx: ctx})
              , cookies = ctx.jar.getCookieString(AccountHTTPClient.get_url())

            assert.equal(result.statusCode, 200)
            assert.equal(cookies.indexOf('koa:sess=;') > -1, true)
        })

        it('should delete session if session does not exist', function * () {
            var ctx = new Context()
              , account_result = yield AccountHTTPClientFixture.post({ctx: ctx})
              , session_del_delete = yield SessionHTTPClientFixture.del({ctx: ctx})
              , result = yield SessionHTTPClientFixture.del({ctx: ctx})
              , cookies = ctx.jar.getCookieString(AccountHTTPClient.get_url())

            assert.equal(result.statusCode, 200)
            assert.equal(cookies.indexOf('koa:sess=;') > -1, true)
        })
    })
})