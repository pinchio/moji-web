var assert = require('chai').assert
  , co_mocha = require('co-mocha')
  , config = require('config')
  , host = config.get('server').host
  , path = require('path')
  , port = config.get('server').port
  , AccountHTTPClientFixture = require('src/account/server/AccountHTTPClientFixture').get_instance()
  , EmojiCollectionHTTPClientFixture = require('src/emoji_collection/server/EmojiCollectionHTTPClientFixture').get_instance()
  , EmojiCollectionFollowerHTTPClientFixture = require('src/emoji_collection_follower/server/EmojiCollectionFollowerHTTPClientFixture').get_instance()
  , Context = require('src/common/server/Context')

// FIXME: maybe rename Context to TestContext
describe('EmojiCollectionFollowerHTTPService', function() {
    describe('post', function () {
        it('should not be allowed to follow when not logged in', function * () {
            var ctx1 = new Context()
            yield EmojiCollectionFollowerHTTPClientFixture.post({ctx: ctx1})
            assert.equal(ctx1.responses[0].statusCode, 401)
        })

        it.skip('should not be allowed to follow private collection', function * () {
            var ctx1 = new Context()
              , ctx2 = new Context()

            yield AccountHTTPClientFixture.post({ctx: ctx1, fields: {account: 'account'}})
            yield AccountHTTPClientFixture.post({ctx: ctx2, fields: {account: 'account'}})

            yield EmojiCollectionHTTPClientFixture.post({ctx: ctx1, body: {scopes: []}})

            yield EmojiCollectionFollowerHTTPClientFixture.post({
                ctx: ctx2
              , body: {
                    emoji_collection_id: ctx1.emoji_collection.id
                }
            })

            assert.equal(ctx2.responses[0].statusCode, 404)
        })
    })
})
