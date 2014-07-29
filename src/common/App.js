/** @jsx React.DOM */
var React = require('react/addons')
  , $ = require('jquery')
  // , MenuComponent = require('../menu/MenuComponent')
  , PagesContainer = require('./PagesContainer')
  , db = require('./Db').get_instance()
  , StaticMixin = require('./StaticMixin')
  , _ = require('underscore')

// TODO: Write a mixin for resize events.

var App = React.createClass({
    statics: _.extend({}, StaticMixin)
  , getDefaultProps: function() {
        return {
        }
    }
  , render: function() {
        // The menu used to be in body.
        this.pages_container = <PagesContainer db={db}/>
        return (
            <div className="body">
                {this.pages_container}
            </div>
        )
    }
  , go: function(page_type, params) {
        this.pages_container.go(page_type, params)
    }
})

module.exports = App
