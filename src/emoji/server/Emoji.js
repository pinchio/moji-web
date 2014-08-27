var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , ModelMixin = require('src/common/ModelMixin')
  , Moment = require('moment')
  , uuid = require('node-uuid')

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
  , 'deleted_at'
  , 'slug_name'
  , 'display_name'
  , 'tags'
  , 'scopes'
  , 'created_by'
  , 'asset_url'
  , 'asset_hash'
  , 'sent_count'
  , 'saved_count'
  , 'emoji_collection_id'
  , 'ancestor_emoji_id'
  , 'parent_emoji_id'
  , 'extra_data'
]

Emoji.from_create = function(o) {
    return new Emoji({
        id: o.id || uuid.v4()
      , created_at: 'now()'
      , updated_at: 'now()'
      , deleted_at: null
      , slug_name: o.slug_name
      , display_name: o.display_name
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
      , asset_url: o.asset_url
      , asset_hash: o.asset_hash
      , sent_count: 0
      , saved_count: 0
      , emoji_collection_id: o.emoji_collection_id
      , ancestor_emoji_id: o.ancestor_emoji_id
      , parent_emoji_id: o.parent_emoji_id
      , extra_data: o.extra_data
    })
}

Emoji.from_update = function(o) {
    return new Emoji({
        id: o.id || uuid.v4()
      , created_at: o.created_at || 'now()'
      , updated_at: o.updated_at || 'now()'
      , deleted_at: o.deleted_at || null
      , slug_name: o.slug_name
      , display_name: o.display_name
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
      , asset_url: o.asset_url
      , asset_hash: o.asset_hash
      , sent_count: o.sent_count
      , saved_count: o.saved_count
      , emoji_collection_id: o.emoji_collection_id
      , ancestor_emoji_id: o.ancestor_emoji_id
      , parent_emoji_id: o.parent_emoji_id
      , extra_data: o.extra_data
    })
}

Emoji.from_db = function(o) {
    return new Emoji({
        id: o.id
      , created_at: Emoji.to_moment(o.created_at)
      , updated_at: Emoji.to_moment(o.updated_at)
      , deleted_at: Emoji.to_moment(o.deleted_at)
      , slug_name: o.slug_name
      , display_name: o.display_name
      , tags: o.tags
      , scopes: o.scopes
      , created_by: o.created_by
      , asset_url: o.asset_url
      , asset_hash: o.asset_hash
      , sent_count: o.sent_count
      , saved_count: o.saved_count
      , emoji_collection_id: o.emoji_collection_id
      , ancestor_emoji_id: o.ancestor_emoji_id
      , parent_emoji_id: o.parent_emoji_id
      , extra_data: Emoji.text_to_json(o.extra_data)
    })
}

Emoji.prototype.to_json = function() {
    return {
        id: this.id
      , created_at: Emoji.from_moment(this.created_at)
      , updated_at: Emoji.from_moment(this.updated_at)
      , slug_name: this.slug_name
      , display_name: this.display_name
      , tags: this.tags
      , scopes: this.scopes
      , created_by: this.created_by
      , asset_url: this.asset_url
      , sent_count: this.sent_count
      , saved_count: this.saved_count
      , emoji_collection_id: this.emoji_collection_id
      , extra_data: this.extra_data
    }
}

Emoji.prototype.to_privileged = function() {
    return {
        id: this.id
      , created_at: Emoji.from_moment(this.created_at)
      , updated_at: Emoji.from_moment(this.updated_at)
      , slug_name: this.slug_name
      , display_name: this.display_name
      , tags: this.tags
      , scopes: this.scopes
      , created_by: this.created_by
      , asset_url: this.asset_url
      , sent_count: this.sent_count
      , saved_count: this.saved_count
      , emoji_collection_id: this.emoji_collection_id
      , extra_data: this.extra_data
    }
}

Emoji.prototype.to_db = function() {
    return {
        id: this.id
      , created_at: Emoji.from_moment(this.created_at)
      , updated_at: Emoji.from_moment(this.updated_at)
      , deleted_at: Emoji.from_moment(this.deleted_at)
      , slug_name: this.slug_name
      , display_name: this.display_name
      , tags: this.tags
      , scopes: this.scopes
      , created_by: this.created_by
      , asset_url: this.asset_url
      , asset_hash: this.asset_hash
      , sent_count: this.sent_count
      , saved_count: this.saved_count
      , emoji_collection_id: this.emoji_collection_id
      , ancestor_emoji_id: this.ancestor_emoji_id
      , parent_emoji_id: this.parent_emoji_id
      , extra_data: Emoji.json_to_text(this.extra_data)
    }
}

Emoji.prototype.clone = function(o) {
    return new Emoji(_.defaults(o, this))
}

module.exports = Emoji
