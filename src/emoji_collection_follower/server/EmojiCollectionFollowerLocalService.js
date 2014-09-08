var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , StaticMixin = require('src/common/StaticMixin')
  , uuid = require('node-uuid')
  , ValidationMixin = require('src/common/server/ValidationMixin')

var EmojiCollectionFollowerLocalService = function EmojiCollectionFollowerLocalService() {
    this.ns = 'EmojiCollectionFollowerLocalService'
}
_.extend(EmojiCollectionFollowerLocalService, StaticMixin)
_.extend(EmojiCollectionFollowerLocalService.prototype, ValidationMixin.prototype)

EmojiCollectionFollowerLocalService.prototype.create = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_uuid(o.emoji_collection_id, 'Emoji collection ids')

    var emoji_collection_follower = EmojiCollectionFollower.from_create({
            emoji_collection_id: o.emoji_collection_id
          , follower: o.session.account_id
        })
      , inserted_emoji_collection_follower = yield EmojiCollectionFollowerPersistenceService.insert(emoji_collection_follower)

    return inserted_emoji_collection_follower
}

EmojiCollectionFollowerLocalService.prototype.get_by_id = function * (o) {
    yield this.validate_uuid(o.id, 'Emoji collection follower ids')

    return (yield EmojiCollectionFollowerPersistenceService.select_by_id({id: o.id})).first()
}

EmojiCollectionFollowerLocalService.prototype.delete_by_id = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_uuid(o.id, 'Emoji collection follower ids')

    var emoji_collection_follower = (yield EmojiCollectionFollowerPersistenceService.select_by_id({id: o.id})).first()

    if (emoji_collection_follower) {
        // Cannot delete someone else's.
        if (emoji_collection_follower.follower !== o.session.account_id) {
            throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
        }

        yield this.delete_by_id(emoji_collection_follower)
        return emoji_collection_follower
    } else {
        return null
    }
}

module.exports = EmojiCollectionFollowerLocalService

var EmojiCollectionFollower = require('./EmojiCollectionFollower')
  , EmojiCollectionFollowerPersistenceService = require('./EmojiCollectionFollowerPersistenceService').get_instance()
