var _ = require('underscore')
  , ClientMixin = require('src/common/server/ClientMixin')
  , StaticMixin = require('src/common/StaticMixin')

var EmojiCollectionFollowerHTTPClient = function EmojiCollectionFollowerHTTPClient() {
    this.ns = 'EmojiCollectionFollowerHTTPClient'
}
_.extend(EmojiCollectionFollowerHTTPClient, StaticMixin)
_.extend(EmojiCollectionFollowerHTTPClient.prototype, ClientMixin.prototype)

EmojiCollectionFollowerHTTPClient.prototype.post = function * (o) {
    var req = {
            url: o.url ? this.get_url(o.url) : this.get_url('/_/api/emoji_collection_follower')
          , method: 'POST'
          , json: o.body
          , jar: o.jar
        }
      , result = yield this.request(req)

    return result
}

module.exports = EmojiCollectionFollowerHTTPClient
