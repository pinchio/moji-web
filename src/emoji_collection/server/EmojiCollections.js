var _ = require('underscore')
  , EmojiCollection = require('./EmojiCollection')
  , CollectionMixin = require('../../common/CollectionMixin')

var EmojiCollections = function(o) {
    var self = this

    this.ns = 'EmojiCollections'
    EmojiCollections.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
EmojiCollections.keys = ['list']
EmojiCollections.model = EmojiCollection
_.extend(EmojiCollections, CollectionMixin)
_.extend(EmojiCollections.prototype, CollectionMixin.prototype)

module.exports = EmojiCollections
