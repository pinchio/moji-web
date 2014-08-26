var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , ModelMixin = require('src/common/ModelMixin')
  , Moment = require('moment')
  , uuid = require('node-uuid')

var Account = function(o) {
    var self = this

    this.ns = 'Account'
    Account.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
_.extend(Account, ModelMixin)
Account.keys = [
    'id'
  , 'created_at'
  , 'updated_at'
  , 'username'
  , 'email'
  , 'full_name'
  , 'password'
  , 'profile_image_url'
  , 'born_at'
  , 'extra_data'
]

Account.from_create = function(o) {
    return new Account({
        id: uuid.v4()
      , created_at: 'now()'
      , updated_at: 'now()'
      , username: o.username
      , email: o.email
      , full_name: o.full_name
      , password: o.password
      , profile_image_url: o.profile_image_url
      , born_at: Account.to_moment(o.born_at)
      , extra_data: o.extra_data
    })
}

Account.from_update = function(o) {
    return new Account({
        id: o.id
      , created_at: Account.to_moment(o.created_at)
      , updated_at: Account.to_moment(o.updated_at)
      , username: o.username
      , email: o.email
      , full_name: o.full_name
      , password: o.password
      , profile_image_url: o.profile_image_url
      , born_at: Account.to_moment(o.born_at)
      , extra_data: o.extra_data
    })
}

Account.from_db = function(o) {
    return new Account({
        id: o.id
      , created_at: Account.to_moment(o.created_at)
      , updated_at: Account.to_moment(o.updated_at)
      , username: o.username
      , email: o.email
      , full_name: o.full_name
      , password: o.password
      , profile_image_url: o.profile_image_url
      , born_at: Account.to_moment(o.born_at)
      , extra_data: Account.text_to_json(o.extra_data)
    })
}

Account.prototype.to_json = function() {
    return {
        id: this.id
      , created_at: Account.from_moment(this.created_at)
      , username: this.username
      , profile_image_url: this.profile_image_url
    }
}

Account.prototype.to_privileged = function() {
    return {
        id: this.id
      , created_at: Account.from_moment(this.created_at)
      , updated_at: Account.from_moment(this.updated_at)
      , username: this.username
      , email: this.email
      , full_name: this.full_name
      , profile_image_url: this.profile_image_url
      , born_at: this.born_at
      , extra_data: this.extra_data
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
      , profile_image_url: this.profile_image_url
      , born_at: Account.from_moment(this.born_at)
      , extra_data: Account.json_to_text(this.extra_data)
    }
}

module.exports = Account
