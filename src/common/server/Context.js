var request = require('request')

var Context = function Context () {
    this.jar = request.jar()
    this.responses = []
}

Context.prototype.update = function(result, fields) {
    this.responses.push(result[0])

    if (fields) {
        var keys = Object.keys(fields)

        for (var i = 0, ii = keys.length; i < ii; ++i) {
            var key = keys[i]
            this[fields[key]] = result[1][key]
        }
    }
}

module.exports = Context
