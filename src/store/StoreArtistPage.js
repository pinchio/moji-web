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
                                    <div className="landing-page-section-background-container">
                                        <div className="landing-page-section-background">
                                        </div>
                                    </div>
                                    <div className="landing-page-section-container">
                                        <div className="landing-page-section">
                                            <h1 className="landing-h1">Publish Stickers for iMessage, Facebook and more</h1>
                                            <br/>
                                            <p className="landing-p">
                                                The Mojigram StickerStore is a <span className="emphasis">fast</span> and <span className="emphasis">fun</span> way to share your sticker and emoji creations with the world.
                                            </p>
                                            <br/>
                                            <p className="landing-p">
                                                Millions of people around the world could be using your stickers.
                                            </p>
                                            <br/>
                                            <p className="landing-p">
                                                It will always be free to publish stickers and you can make money doing it too :)
                                            </p>
                                            <br/>
                                            <br/>
                                            <h1 className="landing-h1">Sign Up</h1>
                                            <br/>
                                            <div className="landing-email-form-container">
                                                <div className="landing-email-input-container">
                                                    <input className="input" type="email" placeholder="Email address" />
                                                </div>
                                                <div className="landing-email-button-container">
                                                    <div className="landing-email-button button button-success">
                                                        Submit
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="landing-page-footer-container">
                        <div className="landing-page-footer">
                            <ul className="footer-items">
                                <a href="mailto:contact@mojigram.com">
                                    <li className="footer-item">CONTACT US</li>
                                </a>
                                <a href="/tos">
                                    <li className="footer-item">TERMS</li>
                                </a>
                                <li className="footer-item copyright">&copy; 2014 MOJIGRAM</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = HomePage
