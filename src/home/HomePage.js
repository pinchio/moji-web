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
        var itunesLink = "https://itunes.apple.com/us/app/mojigram/id912008559?ls=1&mt=8"
        return (
            <div className={this.state.classNames.join(' ')}>
                <div className="page">
                    <div className="page-body-container">
                        <div className="page-body">
                            <div className="sprite-home-icon-bg-container">
                                <div className="sprite sprite-home-icon-bg"></div>
                            </div>
                            <div className="home-cta-container">
                                <div className="sprite-home-logo-container">
                                    <div className="sprite sprite-home-logo"></div>
                                </div>
                                <p>Create your own stickers</p>
                                <br/><br/>
                                <a target="_blank" href={itunesLink}>
                                    <div className="sprite sprite-app-store-badge-en"></div>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        © 2014, Mojigram. <a href="mailto:direct@mojigram.com" target="_blank" >Contact Us</a>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = HomePage
