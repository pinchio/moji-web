var _ = require('underscore')
  , Emoji = require('./Emoji')
  , CollectionMixin = require('src/common/CollectionMixin')

var Emojis = function(o) {
    this.ns = 'Emojis'
    for (var i = 0, ii = Emojis.keys.length; i < ii; ++i) {
        var key = Emojis.keys[i]
        this[key] = o[key]
    }
}
_.extend(Emojis, CollectionMixin)
_.extend(Emojis.prototype, CollectionMixin.prototype)

Emojis.model = Emoji

module.exports = Emojis
