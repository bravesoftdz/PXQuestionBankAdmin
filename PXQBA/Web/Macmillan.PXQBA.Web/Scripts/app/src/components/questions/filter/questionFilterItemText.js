﻿/**
* @jsx React.DOM
*/

var QuestionFilterItemText = React.createClass({
    
    getInitialState: function() {
        return { value: this.getTextFromCurrentValues(this.props.currentValues) };
    },

    onChangeHandler: function(text) { 
        this.setState({value: text});
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
                <div> 
                    <table className="filter-text-table">
                      <tr>
                        <td>
                         <TextEditor value={this.state.value}
                               dataChangeHandler={this.onChangeHandler} 
                               classNameProps="filter-text-input"
                               onKeyPressHandler={this.onKeyPress}
                               />
                        </td>
                        <td>
                         <button type="button" className="btn btn-default btn-sm" onClick={this.onCancelEventHandler} data-toggle="tooltip" title="Cancel">
                                  <span className="glyphicon glyphicon-remove"></span>
                          </button>
                        </td>
                      </tr>
                    </table>
                     
                          
                </div>
            );
        }
});