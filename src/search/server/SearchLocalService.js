var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , StaticMixin = require('src/common/StaticMixin')
  , ValidationMixin = require('src/common/server/ValidationMixin')

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
      , accounts = yield AccountLocalService.get_by_query({
            query: query
          , session: o.session
        })

    return {emojis: emojis, emoji_collections: emoji_collections, accounts: accounts}
}

module.exports = SearchLocalService

var AccountLocalService = require('src/account/server/AccountLocalService').get_instance()
  , EmojiCollectionLocalService = require('src/emoji_collection/server/EmojiCollectionLocalService').get_instance()
  , EmojiLocalService = require('src/emoji/server/EmojiLocalService').get_instance()
