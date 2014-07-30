var assert = require('assert')
  , _ = require('underscore')
  , Moment = require('moment')
  , Account = require('./Account')

var Accounts = function(o) {
    var self = this

    this.ns = 'Accounts'
    Accounts.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
Accounts.keys = ['list']

Accounts.from_db = function(raw) {
    var results = []

    for (var i = 0, ii = raw.length; i < ii; ++i) {
        var o = raw[i]
          , result = Account.from_db(o)

        results.push(result)
    }

    return new Accounts({list: results})
}

module.exports = Accounts
