var HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , _ = require('underscore')
  , StaticMixin = require('src/common/StaticMixin')
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
              , expand = self.parse_expand(this.query.expand)

            if (results) {
                // Results is {emoji_collections=[], emojis=[], users=[]}.
                return self.handle_success(this, {
                    emojis: yield results.emojis.to_json({
                        expand: expand && expand.emojis
                      , session: this.session
                    })
                  , emoji_collections: yield results.emoji_collections.to_json({
                        expand: expand && expand.emoji_collections
                      , session: this.session
                    })
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
