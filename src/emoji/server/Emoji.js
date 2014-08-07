var _ = require('underscore')
  , Moment = require('moment')
  , uuid = require('node-uuid')
  , validator = require('validator')
  , ModelMixin = require('../../common/ModelMixin')
  , LocalServiceError = require('src/common').LocalServiceError

var Emoji = function(o) {
    var self = this

    this.ns = 'Emoji'
    Emoji.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
_.extend(Emoji, ModelMixin)
Emoji.keys = [
    'id'
  , 'created_at'
  , 'updated_at'
  , 'slug_name'
  , 'display_name'
  , 'image_url'
  , 'tags'
  , 'scopes'
  , 'created_by'
]

Emoji.from_create = function(o) {
    return new Emoji({
        id: uuid.v4()
      , created_at: 'now()'
      , updated_at: 'now()'
      , slug_name: o.slug_name
      , display_name: o.display_name
      , image_url: o.image_url
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
    })
}

Emoji.from_db = function(o) {
    return new Emoji({
        id: o.id
      , created_at: new Moment(o.created_at)
      , updated_at: new Moment(o.updated_at)
      , slug_name: o.slug_name
      , display_name: o.display_name
      , image_url: o.image_url
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
    })
}

Emoji.prototype.to_privileged = function() {
    return {
        id: this.id
      , created_at: this.created_at.toISOString()
      , updated_at: this.updated_at.toISOString()
      , slug_name: this.slug_name
      , display_name: this.display_name
      , image_url: this.image_url
      , tags: this.tags
      , scopes: this.scopes
      , created_by: this.created_by
    }
}

Emoji.prototype.to_db = function() {
    return {
        id: this.id
      , created_at: Emoji.from_moment(this.created_at)
      , updated_at: Emoji.from_moment(this.updated_at)
      , slug_name: this.slug_name
      , display_name: this.display_name
      , image_url: this.image_url
      , tags: this.tags
      , scopes: this.scopes
      , created_by: this.created_by
    }
}

module.exports = Emoji
