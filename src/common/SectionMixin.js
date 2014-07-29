/** @jsx React.DOM */
var React = require('react/addons')
  , $ = require('jquery')

var SectionMixin = {
    section_arrow: function() {
        return (
            <div className="section-arrow-container">
                <div className="section-arrow sprite sprite-arrow-right-grey"></div>
            </div>
        )
    }
  , section_loading: function(flag) {
        return (
            <div className="sprite-loading-container" style={{display: flag ? 'none' : void 0}}>
                <div className="sprite sprite-loading"></div>
            </div>
        )
    }
}

module.exports = SectionMixin
