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

Emoji.prototype.to_json = function * (o) {
    var result = {}
    result.id = this.id

    if (!this.deleted_at) {
        result.created_at = Emoji.from_moment(this.created_at)
    }

    if (!this.deleted_at) {
        result.updated_at = Emoji.from_moment(this.updated_at)
    }

    if (!this.deleted_at) {
        result.slug_name = this.slug_name
    }

    if (!this.deleted_at) {
        result.display_name = this.display_name
    }

    if (!this.deleted_at) {
        result.tags = this.tags
    }

    if (!this.deleted_at) {
        result.scopes = this.scopes
    }

    if (!this.deleted_at) {
        result.created_by = this.created_by
    }

    if (result.created_by && o.expand && o.expand.created_by) {
        result.created_by_expanded = yield AccountLocalService.get_by_id({id: this.created_by})

        if (result.created_by_expanded) {
            result.created_by_expanded = yield result.created_by_expanded.to_json({
                expand: o.expand.created_by_expanded
              , session: o.session
            })
        }
    }

    if (!this.deleted_at) {
        result.asset_url = this.asset_url
    }

    result.sent_count = this.sent_count
    result.saved_count = this.saved_count

    if (!this.deleted_at) {
        result.ancestor_emoji_id = this.ancestor_emoji_id
    }

    if (result.ancestor_emoji_id && o.expand && o.expand.ancestor_emoji_id) {
        result.ancestor_emoji_id_expanded = yield EmojiLocalService.get_by_id_privileged({id: this.ancestor_emoji_id})

        if (result.ancestor_emoji_id_expanded) {
            result.ancestor_emoji_id_expanded = yield result.ancestor_emoji_id_expanded.to_json({
                expand: o.expand.ancestor_emoji_id_expanded
              , session: o.session
            })
        }
    }

    if (!this.deleted_at) {
        result.parent_emoji_id = this.parent_emoji_id
    }

    if (!this.deleted_at) {
        result.emoji_collection_id = this.emoji_collection_id
    }

    if (result.emoji_collection_id && o.expand && o.expand.emoji_collection_id) {
        result.emoji_collection_id_expanded = yield EmojiCollectionLocalService.get_by_id_privileged({
            id: this.emoji_collection_id
        })

        if (result.emoji_collection_id_expanded) {
            result.emoji_collection_id_expanded = yield result.emoji_collection_id_expanded.to_json({
                expand: o.expand.emoji_collection_id_expanded
              , session: o.session
            })
        }
    }

    if (!this.deleted_at) {
        result.extra_data = this.extra_data
    }

    return result
}

Emoji.prototype.clone = function(o) {
    return new Emoji(_.defaults(o, this))
}

module.exports = Emoji

var AccountLocalService = require('src/account/server/AccountLocalService').get_instance()
  , EmojiLocalService = require('src/emoji/server/EmojiLocalService').get_instance()
  , EmojiCollectionLocalService = require('src/emoji_collection/server/EmojiCollectionLocalService').get_instance()
