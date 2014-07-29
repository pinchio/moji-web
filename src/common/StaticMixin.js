var StaticMixin = function() {}

StaticMixin.get_instance = function() {
    return this.instance ? this.instance : (this.instance = new this())
}

module.exports = StaticMixin
