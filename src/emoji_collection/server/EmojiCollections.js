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

EmojiCollections.prototype.filter_for_mojiboard = function * () {
    var filtered_emoji_collections = []
    for (var i = 0, ii = this.list.length; i < ii; ++i) {
        var emoji_collection = this.list[i]
        if (emoji_collection.is_for_mojiboard()) {
            filtered_emoji_collections.push(emoji_collection)
        }
    }

    filtered_emoji_collections = new EmojiCollections({list: filtered_emoji_collections})
    return filtered_emoji_collections
}

module.exports = EmojiCollections
