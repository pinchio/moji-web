var _ = require('underscore')
  , config = require('config')
  , ClientMixin = require('src/common/server/ClientMixin')
  , StaticMixin = require('src/common/StaticMixin')

var FacebookHTTPClient = function FacebookHTTPClient() {
    this.ns = 'FacebookHTTPClient'
}
_.extend(FacebookHTTPClient, StaticMixin)
_.extend(FacebookHTTPClient.prototype, ClientMixin.prototype)

FacebookHTTPClient.prototype.get_graph_debug_token = function * (o) {
        var req = {
            url: 'https://graph.facebook.com/debug_token'
                + '?input_token=' + o.input_token
                + '&access_token=' + config.get('fb').client_id + '|' + config.get('fb').client_secret
          , method: 'GET'
          , json: true
        }
      , result = yield this.request(req)

    return result[0]
}

module.exports = FacebookHTTPClient
