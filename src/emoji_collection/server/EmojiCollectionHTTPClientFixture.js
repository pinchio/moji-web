var _ = require('underscore')
  , request = require('request')
  , uuid = require('node-uuid')
  , StaticMixin = require('src/common/StaticMixin')

var EmojiCollectionHTTPClientFixture = function EmojiCollectionHTTPClientFixture() {
    this.ns = 'EmojiCollectionHTTPClientFixture'
}
_.extend(EmojiCollectionHTTPClientFixture, StaticMixin)

EmojiCollectionHTTPClientFixture.prototype.post = function * (o) {
    var body = _.defaults({
            tags: ['fixture']
          , scopes: ['public_read']
        }, o.body)
      , result = yield EmojiCollectionHTTPClient.post({body: body, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

module.exports = EmojiCollectionHTTPClientFixture

var EmojiCollectionHTTPClient = require('./EmojiCollectionHTTPClient').get_instance()
