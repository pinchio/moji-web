/** @jsx React.DOM */
var React = require('react/addons')
  , HomeHeaderComponent = require('./HomeHeaderComponent')
  , PageMixin = require('../common/PageMixin')

var HomePage = React.createClass({
    mixins: [PageMixin]
  , getInitialState: function() {
        return {
            classNames: ['page-container']
          , ns: 'HomePage'
        }
    }
  , get_key: function() {
        return 'home'
    }
  , render: function() {
        return (
            <div className={this.state.classNames.join(' ')}>
                <div className="page">
                    <HomeHeaderComponent
                        toggle_menu={this.props.toggle_menu}
                        scroll_body_to_top={this.scroll_page_to_top} />
                    <div className="page-body-container">
                        <div className="page-body">
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                            <p>asdf</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = HomePage
