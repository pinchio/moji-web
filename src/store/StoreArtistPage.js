/** @jsx React.DOM */
var React = require('react/addons')
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
        return 'store_artist'
    }
  , render: function() {
        return (
            <div className="landing-page-container">
                <div className="landing-page">
                    <div className="landing-page-background-container">
                        <div className="landing-page-background">
                        </div>
                    </div>
                    <div className="landing-page-body-container">
                        <div className="landing-page-body">
                            <div className="landing-page-body-side-container">
                                <div className="landing-page-body-side">
                                    <div className="sprite sprite-sticker-pack-phone"></div>
                                </div>
                            </div>
                            <div className="landing-page-body-main-container">
                                <div className="landing-page-body-main">
                                    <div className="sprite sprite-brand-header"></div>
                                    Some copy here
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="landing-page-footer-container">
                        footer
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = HomePage
