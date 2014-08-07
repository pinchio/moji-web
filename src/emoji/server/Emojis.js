var assert = require('assert')
  , _ = require('underscore')
  , Moment = require('moment')
  , Emoji = require('./Emoji')

var Emojis = function(o) {
    var self = this

    this.ns = 'Emojis'
    Emojis.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
Emojis.keys = ['list']

Emojis.from_db = function(raw) {
    var results = []

    for (var i = 0, ii = raw.length; i < ii; ++i) {
        var o = raw[i]
          , result = Emoji.from_db(o)

        results.push(result)
    }

    return new Emojis({list: results})
}

module.exports = Emojis
