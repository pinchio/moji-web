var assert = require('assert')
  , _ = require('underscore')
  , Moment = require('moment')
  , EmojiCollection = require('./EmojiCollection')

var EmojiCollections = function(o) {
    var self = this

    this.ns = 'EmojiCollections'
    EmojiCollections.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
EmojiCollections.keys = ['list']

EmojiCollections.from_db = function(raw) {
    var results = []

    for (var i = 0, ii = raw.length; i < ii; ++i) {
        var o = raw[i]
          , result = EmojiCollection.from_db(o)

        results.push(result)
    }

    return new EmojiCollections({list: results})
}

module.exports = EmojiCollections
