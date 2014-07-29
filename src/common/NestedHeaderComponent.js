/** @jsx React.DOM */
var React = require('react/addons')
  , HeaderMixin = require('../common/HeaderMixin')

var NestedHeaderComponent = React.createClass({
    mixins: [HeaderMixin]
  , render: function() {
        return (
            <div className="page-header-container">
                <div className="page-header">
                    <a href="/" data-leave="slide-out-to-right" data-enter="slide-in-from-left">
                        <div className="page-header-left">
                            <div className="page-header-back">
                                <div className="page-header-back-sprite-container">
                                    <div className="page-header-back-sprite sprite sprite-arrow-left-big-white"></div>
                                </div>
                                {this.props.back_text}
                            </div>
                        </div>
                    </a>
                    <div className="page-header-center"
                        onClick ={this.props.scroll_body_to_top}>
                        <div className="page-header-text page-header-title">{this.props.title}</div>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = NestedHeaderComponent
