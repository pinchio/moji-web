var HTTPServiceMixin = require('src/common').HTTPServiceMixin
  , _ = require('underscore')
  , StaticMixin = require('../../common/StaticMixin')
  , SearchLocalService = require('./SearchLocalService').get_instance()

var SearchHTTPService = function SearchHTTPService() {
    this.ns = 'SearchHTTPService'
}
_.extend(SearchHTTPService, StaticMixin)
_.extend(SearchHTTPService.prototype, HTTPServiceMixin.prototype)

SearchHTTPService.prototype.list = function() {
    var self = this

    return function * (next) {
        try {
            if (this.query.q) {
                this.query.query = this.query.q
            }

            var results = yield SearchLocalService.get_by_query({
                    query: this.query.query
                  , session: this.session
                  , req: this.request
                })

            if (results) {
                // Results is {emoji_collections=[], emojis=[], users=[]}.
                return self.handle_success(this, {
                    emoji_collections: results.emoji_collections.to_json()
                  , emojis: results.emojis.to_json()
                  // , accounts: results.accounts.to_json()
                }, 'json')
            } else {
                return self.handle_success(this, null)
            }
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = SearchHTTPService
