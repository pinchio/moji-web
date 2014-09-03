var _ = require('underscore')
  , CollectionMixin = require('src/common/CollectionMixin')
  , EmojiCollectionFollower = require('./EmojiCollectionFollower')

var EmojiCollectionFollowers = function(o) {
    this.ns = 'EmojiCollectionFollowers'
    for (var i = 0, ii = EmojiCollectionFollowers.keys.length; i < ii; ++i) {
        var key = EmojiCollectionFollowers.keys[i]
        this[key] = o[key]
    }
}
_.extend(EmojiCollectionFollowers, CollectionMixin)
_.extend(EmojiCollectionFollowers.prototype, CollectionMixin.prototype)

EmojiCollectionFollowers.model = EmojiCollectionFollower

module.exports = EmojiCollectionFollowers
