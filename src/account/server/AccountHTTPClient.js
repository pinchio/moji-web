var _ = require('underscore')
  , ClientMixin = require('src/common/server/ClientMixin')
  , StaticMixin = require('src/common/StaticMixin')

var AccountHTTPClient = function AccountHTTPClient() {
    this.ns = 'AccountHTTPClient'
}
_.extend(AccountHTTPClient, StaticMixin)
_.extend(AccountHTTPClient.prototype, ClientMixin.prototype)

AccountHTTPClient.prototype.post = function * (o) {
    var req = {
            url: o.url ? this.get_url(o.url) : this.get_url('/_/api/account')
          , method: 'POST'
          , json: o.body || true
          , jar: o.jar
        }
      , result = yield this.request(req)

    return result[0]
}

AccountHTTPClient.prototype.put = function * (o) {
    var req = {
            url: o.url ? this.get_url(o.url) : this.get_url('/_/api/account/' + o.id)
          , method: 'PUT'
          , json: o.body || true
          , jar: o.jar
        }
      , result = yield this.request(req)

    return result[0]
}

AccountHTTPClient.prototype.get = function * (o) {
    var req = {
            url: o.url ? this.get_url(o.url) : this.get_url('/_/api/account/' + o.id)
          , method: 'GET'
          , json: true || true
          , jar: o.jar
        }
      , result = yield this.request(req)

    return result[0]
}

module.exports = AccountHTTPClient
