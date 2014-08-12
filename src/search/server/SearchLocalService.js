var _ = require('underscore')
  , validator = require('validator')
  , LocalServiceError = require('src/common').LocalServiceError
  , StaticMixin = require('../../common/StaticMixin')

var SearchLocalService = function SearchLocalService() {
    this.ns = 'SearchLocalService'
}
_.extend(SearchLocalService, StaticMixin)

SearchLocalService.prototype.validate_session = function(session) {
    if (!session.account_id) {
        throw new LocalServiceError(this.ns, 'unauthorized', 'Authentication required.', 401)
    }
}

SearchLocalService.prototype.validate_query = function(query) {
    if (!validator.isLength(query, 2)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Queries must be at least 2 characters.', 400)
    }
}

SearchLocalService.prototype.get_by_query = function * (o) {
    this.validate_session(o.session)
    this.validate_query(o.query)

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

    // return {emojis: emojis, emoji_collections: emoji_collections, accounts: emojis}
    return {emojis: emojis, emoji_collections: emoji_collections}
}

module.exports = SearchLocalService

var EmojiCollectionLocalService = require('../../emoji_collection/server/EmojiCollectionLocalService').get_instance()
  , EmojiLocalService = require('../../emoji/server/EmojiLocalService').get_instance()
