var $ = require('jquery')

var PageMixin = {
    animation_enter: function(animation_style) {
        this.setState({classNames: ['page-container', animation_style]})
    }
  , animation_leave: function(animation_style) {
        this.setState({classNames: ['page-container', animation_style]})
    }
  , scroll_page_to_top: function() {
        var $page_body_container = $(this.getDOMNode()).find('.page-body-container')
          , $sentinel = $(this.getDOMNode()).find('.sentinel')
          , page_body_container_scroll_top = $page_body_container.scrollTop()

        if (page_body_container_scroll_top === 0) {
            location.reload(true)
        } else {
            $page_body_container.css({'overflow-y': 'hidden'})

            setTimeout(function() {
                $page_body_container.css({'overflow-y': 'auto'})
                $sentinel
                    .velocity('scroll', {duration: 200, easing: 'ease-in-out', container: $page_body_container})
                    .velocity({opacity: 1})
            }, 0)
        }
    }
}

module.exports = PageMixin
