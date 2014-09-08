var _ = require('underscore')
  , request = require('request')
  , uuid = require('node-uuid')
  , StaticMixin = require('src/common/StaticMixin')

var EmojiCollectionFollowerHTTPClientFixture = function EmojiCollectionFollowerHTTPClientFixture() {
    this.ns = 'EmojiCollectionFollowerHTTPClientFixture'
}
_.extend(EmojiCollectionFollowerHTTPClientFixture, StaticMixin)

EmojiCollectionFollowerHTTPClientFixture.prototype.post = function * (o) {
    var body = _.defaults({}, o.body, {
            emoji_collection_id: ''
        })
      , result = yield EmojiCollectionFollowerHTTPClient.post({body: body, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

module.exports = EmojiCollectionFollowerHTTPClientFixture

var EmojiCollectionFollowerHTTPClient = require('./EmojiCollectionFollowerHTTPClient').get_instance()
