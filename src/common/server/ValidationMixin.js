var LocalServiceError = require('src/common/server/LocalServiceError')

var ValidationMixin = function() {}

ValidationMixin.prototype.validate_session = function * (session) {
    if (!session.account_id) {
        throw new LocalServiceError(this.ns, 'unauthorized', 'Authentication required.', 401)
    }
}

module.exports = ValidationMixin
