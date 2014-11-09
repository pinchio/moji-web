/** @jsx React.DOM */
var React = require('react/addons')
  , class_set = React.addons.classSet
  , $ = require('jquery')

var PagesContainer = React.createClass({
    getInitialState: function() {
        return {
            pages: []
          , current_page: void 0
        }
    }
  , go: function(page) {
        var pages = this.state.pages
          , page_already_exists = false
          , existing_page
          , $el = $(this.getDOMNode())

        for (var i = 0, ii = pages.length; i < ii; ++i) {
            if (pages[i].get_key() === page.get_key()) {
                // We already have this page.
                page_already_exists = true
                existing_page = pages[i]
                break
            }
        }

        $el.removeClass('animate-before animate animate-after')
        $el.addClass('animate-before')

        if (this.state.current_page) {
            this.state.current_page.animation_leave(page.props.data_leave)
        }

        if (page_already_exists) {
            this.setState({current_page: existing_page})
            existing_page.animation_enter(page.props.data_enter)
        } else {
            pages.push(page)
            this.setState({pages: pages, current_page: page})
            page.animation_enter(page.props.data_enter)
        }

        setTimeout(function() {
            $el.removeClass('animate-before').addClass('animate')
        }, 0)
    }
  , render: function() {
        return (
            <div className={class_set({'pages-container': true})}>
                <div className="page">
                    {this.state.pages.map(function(page, i) {
                        return (
                            <div>
                                {page}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
})

module.exports = PagesContainer
