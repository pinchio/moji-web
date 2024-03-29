var _ = require('underscore')
  , Account = require('./Account')
  , CollectionMixin = require('src/common/CollectionMixin')

var Accounts = function(o) {
    this.ns = 'Accounts'
    for (var i = 0, ii = Accounts.keys.length; i < ii; ++i) {
        var key = Accounts.keys[i]
        this[key] = o[key]
    }
}
_.extend(Accounts, CollectionMixin)
_.extend(Accounts.prototype, CollectionMixin.prototype)

Accounts.model = Account

module.exports = Accounts
