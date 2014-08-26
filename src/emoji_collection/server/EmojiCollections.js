var _ = require('underscore')
  , EmojiCollection = require('./EmojiCollection')
  , CollectionMixin = require('src/common/CollectionMixin')

var EmojiCollections = function(o) {
    this.ns = 'EmojiCollections'
    for (var i = 0, ii = EmojiCollections.keys.length; i < ii; ++i) {
        var key = EmojiCollections.keys[i]
        this[key] = o[key]
    }
}
EmojiCollections.keys = ['list']
EmojiCollections.model = EmojiCollection
_.extend(EmojiCollections, CollectionMixin)
_.extend(EmojiCollections.prototype, CollectionMixin.prototype)

module.exports = EmojiCollections
