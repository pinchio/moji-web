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

SearchLocalService.prototype.get_by_query = function * (o) {
    this.validate_session(o.session)

    var emojis = yield EmojiLocalService.get_by_query__created_by({
            query: o.query
          , created_by: o.session.account_id
          , session: o.session
        })
      // , emoji_collections = yield EmojiCollectionLocalService.get_by_query({
      //       query: o.query
      //     , session: o.session
      //   })

    return {emojis: emojis, emoji_collections: emojis, accounts: emojis}
}

module.exports = SearchLocalService

var EmojiCollectionLocalService = require('../../emoji_collection/server/EmojiCollectionLocalService').get_instance()
  , EmojiLocalService = require('../../emoji/server/EmojiLocalService').get_instance()
