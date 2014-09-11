var request = require('request')

var Context = function Context () {
    this.jar = request.jar()
    this.responses = []
}

Context.prototype.update = function(result, fields) {
    result.req_body = JSON.parse(result.request.body.toString())

    this.responses.unshift(result)

    if (fields) {
        var keys = Object.keys(fields)

        for (var i = 0, ii = keys.length; i < ii; ++i) {
            var key = keys[i]
            this[fields[key]] = result[0].body[key]
        }
    }
}

module.exports = Context
