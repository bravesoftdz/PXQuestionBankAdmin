﻿/**
* @jsx React.DOM
*/ 

var QuestionInlineEditorSingleSelect = React.createClass({displayName: 'QuestionInlineEditorSingleSelect',

    changeEventHandler: function(event) {
        var value = event.target.getAttribute("data-value");
         this.props.saveVelueHandler(value)
    },

    renderMenuItems: function() {
        var items = [];
        for (var propertyName in this.props.values) {
            items.push(this.renderMenuItem(this.props.values[propertyName], propertyName));
        }
        return items;
    },

    renderMenuItem: function(label, value) {
        return (React.DOM.li( {role:"presentation"}, React.DOM.a( {className:"edit-field-item", role:"menuitem", tabIndex:"-1", 'data-value':value}, label)));
    },

    render: function() {
        return ( 
            React.DOM.div(null, 
                React.DOM.div( {className:"dropdown"}, 
                    React.DOM.button( {className:"btn dropdown-toggle sr-only", type:"button", id:"dropdownMenuType", 'data-toggle':"dropdown"}, 
                       "Dropdown",
                    React.DOM.span( {className:"caret"})
                    ),
                    React.DOM.ul( {className:"dropdown-menu menu-show", role:"menu", 'aria-labelledby':"dropdownMenuType", onClick:this.changeEventHandler}, 
                       this.renderMenuItems()
                     )
                 )
            )
            );
        }
});