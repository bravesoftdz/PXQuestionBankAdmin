﻿/**
* @jsx React.DOM
*/ 

var SingleSelectButton = React.createClass({

    cancelValue: '__cancel',

    selectValueEventHandler: function(event) {
        var value = event.target.getAttribute("data-value");
        if(value==null) {
            this.props.cancelHandler();
            return;
        }

        if(value==this.cancelValue) {
            this.props.cancelHandler();
            return;
        }

        this.props.selectHandler(value);
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
                 <div className="btn-group">
                  <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                    {this.props.caption} <span className="caret"></span>
                  </button>
                  <ul className="dropdown-menu" role="menu" onClick={this.selectValueEventHandler}>
                     {this.renderMenuItems()}
                    <li className="divider"></li>
                    <li role="presentation"><a className="edit-field-item" role="menuitem" tabIndex="-1" data-value={this.cancelValue}>Cancel</a></li>
                  </ul>
                </div>
            </div>
            );
        }
});