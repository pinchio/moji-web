var _ = require('underscore')
  , Moment = require('moment')
  , uuid = require('node-uuid')
  , validator = require('validator')
  , ModelMixin = require('../../common/ModelMixin')
  , LocalServiceError = require('src/common').LocalServiceError

var Account = function(o) {
    var self = this

    this.ns = 'Account'
    Account.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
_.extend(Account, ModelMixin)
Account.keys = ['id', 'created_at', 'updated_at', 'username', 'email', 'full_name', 'password', 'born_at']

Account.from_create = function(o) {
    return new Account({
        id: uuid.v4()
      , created_at: 'now()'
      , updated_at: 'now()'
      , username: o.username
      , email: o.email
      , full_name: o.full_name
      , password: o.password
      , born_at: Account.to_moment(o.born_at)
    })
}

Account.from_db = function(o) {
    return new Account({
        id: o.id
      , created_at: new Moment(o.created_at)
      , updated_at: new Moment(o.updated_at)
      , username: o.username
      , email: o.email
      , full_name: o.full_name
      , password: o.password
      , born_at: Account.to_moment(o.born_at)
    })
}

Account.prototype.to_json = function() {
    return {
        id: this.id
      , created_at: this.created_at.toISOString()
      , username: this.username
    }
}

Account.prototype.to_privileged = function() {
    return {
        id: this.id
      , created_at: this.created_at.toISOString()
      , updated_at: this.updated_at.toISOString()
      , username: this.username
      , email: this.email
      , full_name: this.full_name
      , born_at: this.born_at
    }
}

Account.prototype.to_db = function() {
    return {
        id: this.id
      , created_at: Account.from_moment(this.created_at)
      , updated_at: Account.from_moment(this.updated_at)
      , username: this.username
      , email: this.email
      , full_name: this.full_name
      , password: this.password
      , born_at: Account.from_moment(this.born_at)
    }
}

module.exports = Account
