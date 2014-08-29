var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , ModelMixin = require('src/common/ModelMixin')
  , Moment = require('moment')
  , uuid = require('node-uuid')

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
  , 'deleted_at'
  , 'slug_name'
  , 'display_name'
  , 'tags'
  , 'scopes'
  , 'created_by'
  , 'extra_data'
]

EmojiCollection.from_create = function(o) {
    return new EmojiCollection({
        id: o.id || uuid.v4()
      , created_at: 'now()'
      , updated_at: 'now()'
      , deleted_at: null
      , slug_name: o.slug_name
      , display_name: o.display_name
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
      , extra_data: o.extra_data
    })
}

EmojiCollection.from_update = function(o) {
    return new EmojiCollection({
        id: o.id || uuid.v4()
      , created_at: o.created_at || 'now()'
      , updated_at: o.updated_at || 'now()'
      , deleted_at: o.deleted_at || null
      , slug_name: o.slug_name
      , display_name: o.display_name
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
      , extra_data: o.extra_data
    })
}

EmojiCollection.from_db = function(o) {
    return new EmojiCollection({
        id: o.id
      , created_at: EmojiCollection.to_moment(o.created_at)
      , updated_at: EmojiCollection.to_moment(o.updated_at)
      , deleted_at: EmojiCollection.to_moment(o.deleted_at)
      , slug_name: o.slug_name
      , display_name: o.display_name
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
      , extra_data: EmojiCollection.text_to_json(o.extra_data)
    })
}

EmojiCollection.prototype.to_json = function * (o) {
    var result = {}

    result.id = this.id
    result.created_at = EmojiCollection.from_moment(this.created_at)
    result.updated_at = EmojiCollection.from_moment(this.updated_at)
    result.slug_name = this.slug_name
    result.display_name = this.display_name
    result.tags = this.tags
    result.scopes = this.scopes
    result.created_by = this.created_by
    result.extra_data = this.extra_data

    return result
}

EmojiCollection.prototype.to_db = function() {
    return {
        id: this.id
      , created_at: EmojiCollection.from_moment(this.created_at)
      , updated_at: EmojiCollection.from_moment(this.updated_at)
      , deleted_at: EmojiCollection.from_moment(this.deleted_at)
      , slug_name: this.slug_name
      , display_name: this.display_name
      , tags: this.tags
      , scopes: this.scopes
      , created_by: this.created_by
      , extra_data: EmojiCollection.json_to_text(this.extra_data)
    }
}

module.exports = EmojiCollection
