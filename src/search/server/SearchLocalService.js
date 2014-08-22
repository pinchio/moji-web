var _ = require('underscore')
  , LocalServiceError = require('src/common').LocalServiceError
  , StaticMixin = require('../../common/StaticMixin')
  , ValidationMixin = require('src/common').ValidationMixin

var SearchLocalService = function SearchLocalService() {
    this.ns = 'SearchLocalService'
}
_.extend(SearchLocalService, StaticMixin)
_.extend(SearchLocalService.prototype, ValidationMixin.prototype)

SearchLocalService.prototype.get_by_query = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_query(o.query)

    // TODO: also get public in addition to private.
    var query = o.query.replace(/\s/g, '&')
      , emojis = yield EmojiLocalService.get_by_query__created_by({
            query: query
          , created_by: o.session.account_id
          , session: o.session
        })
      , emoji_collections = yield EmojiCollectionLocalService.get_by_query__created_by({
            query: query
          , created_by: o.session.account_id
          , session: o.session
        })

    return {emojis: emojis, emoji_collections: emoji_collections}
}

module.exports = SearchLocalService

var EmojiCollectionLocalService = require('../../emoji_collection/server/EmojiCollectionLocalService').get_instance()
  , EmojiLocalService = require('../../emoji/server/EmojiLocalService').get_instance()
