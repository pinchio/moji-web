/** @jsx React.DOM */
var React = require('react/addons')
  , HeaderMixin = require('../common/HeaderMixin')

var HomeHeaderComponent = React.createClass({
    mixins: [HeaderMixin]
  , render: function() {
        return (
            <div className="page-header-container">
                <div className="page-header">
                    <div className="page-header-right">
                        <div className="page-header-icon-container"
                            onClick={this.reload}
                            onTouchEnd={this.reload}>
                            <div className="page-header-icon sprite sprite-safari-refresh-white"></div>
                        </div>
                    </div>
                    <div className="page-header-center"
                        onClick ={this.props.scroll_body_to_top}>
                        <div className="page-header-bloomforex-sprite sprite sprite-bloomforex-white"></div>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = HomeHeaderComponent
