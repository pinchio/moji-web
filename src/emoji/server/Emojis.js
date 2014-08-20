var _ = require('underscore')
  , Emoji = require('./Emoji')
  , CollectionMixin = require('../../common/CollectionMixin')

var Emojis = function(o) {
    this.ns = 'Emojis'
    for (var i = 0, ii = Emojis.keys.length; i < ii; ++i) {
        var key = Emojis.keys[i]
        this[key] = o[key]
    }
}
Emojis.keys = ['list']
Emojis.model = Emoji
_.extend(Emojis, CollectionMixin)
_.extend(Emojis.prototype, CollectionMixin.prototype)

module.exports = Emojis
