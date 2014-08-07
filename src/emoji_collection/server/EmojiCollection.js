var _ = require('underscore')
  , Moment = require('moment')
  , uuid = require('node-uuid')
  , validator = require('validator')
  , ModelMixin = require('../../common/ModelMixin')
  , LocalServiceError = require('src/common').LocalServiceError

var EmojiCollection = function(o) {
    var self = this

    this.ns = 'EmojiCollection'
    EmojiCollection.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
_.extend(EmojiCollection, ModelMixin)
EmojiCollection.keys = [
    'id'
  , 'created_at'
  , 'updated_at'
  , 'slug_name'
  , 'display_name'
  , 'tags'
  , 'scopes'
  , 'created_by'
]

EmojiCollection.from_create = function(o) {
    return new EmojiCollection({
        id: uuid.v4()
      , created_at: 'now()'
      , updated_at: 'now()'
      , slug_name: o.slug_name
      , display_name: o.display_name
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
    })
}

EmojiCollection.from_db = function(o) {
    return new EmojiCollection({
        id: o.id
      , created_at: new Moment(o.created_at)
      , updated_at: new Moment(o.updated_at)
      , slug_name: o.slug_name
      , display_name: o.display_name
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
    })
}

EmojiCollection.prototype.to_privileged = function() {
    return {
        id: this.id
      , created_at: this.created_at.toISOString()
      , updated_at: this.updated_at.toISOString()
      , slug_name: this.slug_name
      , display_name: this.display_name
      , tags: this.tags
      , scopes: this.scopes
      , created_by: this.created_by
    }
}

EmojiCollection.prototype.to_db = function() {
    return {
        id: this.id
      , created_at: EmojiCollection.from_moment(this.created_at)
      , updated_at: EmojiCollection.from_moment(this.updated_at)
      , slug_name: this.slug_name
      , display_name: this.display_name
      , tags: this.tags
      , scopes: this.scopes
      , created_by: this.created_by
    }
}

module.exports = EmojiCollection
