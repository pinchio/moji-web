var assert = require('assert')
  , _ = require('underscore')
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
    if (!validator.isLength(o.username, 3, 15)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Username must be between 3 and 15 characters.', 400)
    }

    if (!validator.isAlphanumeric(o.username)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Username can only contain letters and numbers.', 400)
    }

    if (!validator.isLength(o.password, 8, 32)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Password must be between 8 and 32 characters.', 400)
    }

    if (!validator.isAlphanumeric(o.password)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Password can only contain letters and numbers.', 400)
    }

    if (!validator.isEmail(o.email)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Email is not valid.', 400)
    }

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
