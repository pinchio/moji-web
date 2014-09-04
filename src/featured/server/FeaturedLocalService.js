var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , StaticMixin = require('src/common/StaticMixin')
  , ValidationMixin = require('src/common/server/ValidationMixin')

var FeaturedLocalService = function FeaturedLocalService() {
    this.ns = 'FeaturedLocalService'
    this.mojigram_account_id = 'd23cadef-bacc-43d1-a5b9-4f53185fb710'
}
_.extend(FeaturedLocalService, StaticMixin)
_.extend(FeaturedLocalService.prototype, ValidationMixin.prototype)

FeaturedLocalService.prototype.get = function * (o) {
    yield this.validate_session(o.session)

    var emoji_collections = yield EmojiCollectionLocalService.get_by_created_by__scopes({
        created_by: this.mojigram_account_id
      , scopes: ['public_read']
      , session: o.session
    })

    if (!emoji_collections.list.length) {
        var emojis = new Emojis({list: []})
    } else {
        var featured_collection = emoji_collections.list[0]
        for (var i = 0, ii = emoji_collections.list.length; i < ii; ++i) {
            var collection = emoji_collections.list[i]

            if (collection.display_name === 'Featured') {
                featured_collection = collection
                break;
            }
        }

        var emojis = yield EmojiLocalService.get_by_emoji_collection_id__scopes({
                emoji_collection_id: featured_collection.id
              , scopes: ['public_read']
              , session: o.session
            })
    }

    return {emojis: emojis}
}

module.exports = FeaturedLocalService

var EmojiCollectionLocalService = require('src/emoji_collection/server/EmojiCollectionLocalService').get_instance()
  , EmojiLocalService = require('src/emoji/server/EmojiLocalService').get_instance()
  , Emojis = require('src/emoji/server/Emojis')
