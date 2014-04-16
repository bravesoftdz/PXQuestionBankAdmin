﻿/**
* @jsx React.DOM
*/ 

var QuestionInlineEditorSingleSelect = React.createClass({

    cancelValue: '__cancel',

    changeEventHandler: function(event) {
        var value = event.target.getAttribute("data-value");
        if(value==this.cancelValue) {
            this.props.afterEditingHandler();
            return;
        }

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
        return (<li role="presentation"><a className="edit-field-item" role="menuitem" tabIndex="-1" data-value={value}>{label}</a></li>);
    },

    render: function() {
        return ( 
            <div>
                <div className="dropdown">
                    <ul className="dropdown-menu menu-show" role="menu" aria-labelledby="dropdownMenuType" onClick={this.changeEventHandler}>
                       {this.renderMenuItems()}
                    <li role="presentation" className="divider"></li>
                    <li role="presentation"><a className="edit-field-item" role="menuitem" tabIndex="-1" data-value={this.cancelValue}>Cancel</a></li>
                     </ul>
                 </div>
            </div>
            );
        }
});