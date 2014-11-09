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
                                    <div className="landing-page-section-container">
                                        <div className="landing-page-section">
                                            <h1 className="landing-h1">Publish Stickers on the StickerStore for iMessage, Facebook and more</h1>
                                            <br/>
                                            <br/>
                                            <p className="landing-p">
                                                Mojigram StickerStore is a fast and fun way to share your sticker and emoji creations with the world.
                                            </p>
                                            <br/>
                                            <p className="landing-p">
                                                Billions of users around the world could be using your stickers.
                                            </p>
                                            <br/>
                                            <p className="landing-p">
                                                It will always be free to publish stickers and you can make money doing it too!
                                            </p>
                                            <br/>
                                            <br/>
                                            <h1 className="landing-h1">Register Now</h1>
                                            <br/>
                                            <br/>
                                            <input type="email" placeholder="Email address" />
                                            <p className="landing-p">
                                                We will contact you through email.
                                            </p>
                                        </div>
                                    </div>
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
