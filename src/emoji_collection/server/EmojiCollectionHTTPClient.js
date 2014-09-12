var _ = require('underscore')
  , ClientMixin = require('src/common/server/ClientMixin')
  , StaticMixin = require('src/common/StaticMixin')

var EmojiCollectionHTTPClient = function EmojiCollectionHTTPClient() {
    this.ns = 'EmojiCollectionHTTPClient'
}
_.extend(EmojiCollectionHTTPClient, StaticMixin)
_.extend(EmojiCollectionHTTPClient.prototype, ClientMixin.prototype)

EmojiCollectionHTTPClient.prototype.post = function * (o) {
    var req = {
            url: o.url ? this.get_url(o.url) : this.get_url('/_/api/emoji_collection')
          , method: 'POST'
          , json: o.body
          , jar: o.jar
        }
      , result = yield this.request(req)

    return result[0]
}

module.exports = EmojiCollectionHTTPClient
