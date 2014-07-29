/** @jsx React.DOM */
var React = require('react/addons')

var RouterMixin = {
    componentWillMount: function() {
        this.callback = (function() {
            this.forceUpdate()
        }).bind(this)

        this.props.router.on('route', this.callback)
    }
  , componentWillUnmount: function() {
        this.props.router.off('route', this.callback)
    }
}

module.exports = RouterMixin
