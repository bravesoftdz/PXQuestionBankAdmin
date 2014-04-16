﻿/**
* @jsx React.DOM
*/ 

var QuestionBulkOperationSetStatus = React.createClass({

    cancelHandler: function() {
    },

    selectHandler: function(value) {
        questionDataManager.bulk.setStatus(this.props.selectedQuestions, value)
    },

    render: function() {
        return ( 
            <div> 
            <SingleSelectButton caption='Set status to..'  cancelHandler={this.cancelHandler} selectHandler={this.selectHandler} values={this.props.availableStatuses} />
            </div>
            );
        }
});
