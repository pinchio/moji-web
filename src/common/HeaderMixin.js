var $ = require('jquery')

var HeaderMixin = {
    reload: function(force) {
        window.document.location.reload(force)
    }
}

module.exports = HeaderMixin