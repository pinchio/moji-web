var StaticMixin = require('./StaticMixin')
  , _ = require('underscore')

var Db = function Db() {
    this.data = {}
}

Db.prototype.set = function(key, value) {
    this.data[key] = value
}

Db.prototype.get = function(key) {
    return this.data[key]
}

_.extend(Db, StaticMixin)

module.exports = Db
