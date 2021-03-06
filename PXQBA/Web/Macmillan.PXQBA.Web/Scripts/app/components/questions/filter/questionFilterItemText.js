﻿/**
* @jsx React.DOM
*/

var QuestionFilterItemText = React.createClass({displayName: 'QuestionFilterItemText',
    
    getInitialState: function() {
        return { value: this.getTextFromCurrentValues(this.props.currentValues) };
    },

    onChangeHandler: function(text) { 
        var encodedValue =  encodeURIComponent(text);
        this.setState({value: encodedValue});
    },

    componentWillReceiveProps: function(nextProps) {
      this.setState({value: this.getTextFromCurrentValues(nextProps.currentValues)});
    },

    getTextFromCurrentValues: function(currentValues) {
      var text = "";
      if(currentValues[0]!=null) {
        text=currentValues[0];
      }
      return text;
    },

    onBlurHandler: function() {
      this.setState({value: this.getTextFromCurrentValues(this.props.currentValues)});
    },

    onKeyPress: function(event) {
      if(event.key=="Enter") {
        this.props.onChangeHandler([this.state.value]);
      }
    },

    onCancelEventHandler: function() {
      this.props.onChangeHandler([""]);  
    },

    render: function() {
        return (
                React.DOM.div(null, 
                    React.DOM.table({className: "filter-text-table"}, 
                      React.DOM.tr(null, 
                        React.DOM.td(null, 
                         TextEditor({value: decodeURIComponent(this.state.value), 
                               dataChangeHandler: this.onChangeHandler, 
                               classNameProps: "filter-text-input", 
                               onKeyPressHandler: this.onKeyPress}
                               )
                        ), 
                        React.DOM.td(null, 
                         React.DOM.button({type: "button", className: "btn btn-default btn-sm", onClick: this.onCancelEventHandler, 'data-toggle': "tooltip", title: "Cancel"}, 
                                  React.DOM.span({className: "icon-cancel"})
                          )
                        )
                      )
                    )
                     
                          
                )
            );
        }
});