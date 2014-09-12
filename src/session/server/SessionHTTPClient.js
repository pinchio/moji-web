var _ = require('underscore')
  , ClientMixin = require('src/common/server/ClientMixin')
  , StaticMixin = require('src/common/StaticMixin')

var SessionHTTPClient = function SessionHTTPClient() {
    this.ns = 'SessionHTTPClient'
}
_.extend(SessionHTTPClient, StaticMixin)
_.extend(SessionHTTPClient.prototype, ClientMixin.prototype)

SessionHTTPClient.prototype.post = function * (o) {
    var req = {
            url: o.url ? this.get_url(o.url) : this.get_url('/_/api/session')
          , method: 'POST'
          , json: o.body
          , jar: o.jar
        }
      , result = yield this.request(req)

    return result[0]
}

SessionHTTPClient.prototype.del = function * (o) {
    var req = {
            url: o.url ? this.get_url(o.url) : this.get_url('/_/api/session')
          , method: 'DELETE'
          , json: o.body
          , jar: o.jar
        }
      , result = yield this.request(req)

    return result[0]
}

module.exports = SessionHTTPClient
