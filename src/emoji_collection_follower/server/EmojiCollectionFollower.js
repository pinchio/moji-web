var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , ModelMixin = require('src/common/ModelMixin')
  , Moment = require('moment')
  , uuid = require('node-uuid')

var EmojiCollectionFollower = function(o) {
    var self = this

    this.ns = 'EmojiCollectionFollower'
    EmojiCollectionFollower.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
_.extend(EmojiCollectionFollower, ModelMixin)

EmojiCollectionFollower.keys = [
    'id'
  , 'created_at'
  , 'emoji_collection_id'
  , 'follower'
]

EmojiCollectionFollower.from_create = function(o) {
    return new EmojiCollectionFollower({
        id: uuid.v4()
      , created_at: 'now()'
      , emoji_collection_id: o.emoji_collection_id
      , follower: o.follower
    })
}

EmojiCollectionFollower.from_db = function(o) {
    return new EmojiCollectionFollower({
        id: o.id
      , created_at: EmojiCollectionFollower.to_moment(o.created_at)
      , emoji_collection_id: o.emoji_collection_id
      , follower: o.follower
    })
}

EmojiCollectionFollower.prototype.to_json = function * (o) {
    var result = {}

    result.id = this.id
    result.created_at = EmojiCollectionFollower.from_moment(this.created_at)
    result.emoji_collection_id = this.emoji_collection_id
    result.follower = this.follower

    if (result.emoji_collection_id && o.expand && o.expand.emoji_collection_id) {
        result.emoji_collection_id_expanded = yield EmojiCollectionLocalService.get_by_id_privileged({id: this.emoji_collection_id})

        if (result.emoji_collection_id_expanded) {
            result.emoji_collection_id_expanded = yield result.emoji_collection_id_expanded.to_json({
                expand: o.expand.emoji_collection_id_expanded
              , session: o.session
            })
        }
    }

    if (result.follower && o.expand && o.expand.follower) {
        result.follower_expanded = yield AccountLocalService.get_by_id({id: this.follower})

        if (result.follower_expanded) {
            result.follower_expanded = yield result.follower_expanded.to_json({
                expand: o.expand.follower_expanded
              , session: o.session
            })
        }
    }

    return result
}

EmojiCollectionFollower.prototype.to_db = function() {
    return {
        id: this.id
      , created_at: EmojiCollectionFollower.from_moment(this.created_at)
      , emoji_collection_id: this.emoji_collection_id
      , follower: this.follower
    }
}

module.exports = EmojiCollectionFollower

var AccountLocalService = require('src/account/server/AccountLocalService').get_instance()
  , EmojiCollectionLocalService = require('src/emoji_collection/server/EmojiCollectionLocalService').get_instance()
