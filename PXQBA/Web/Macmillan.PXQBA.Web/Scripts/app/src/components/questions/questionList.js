﻿/**
* @jsx React.DOM  
*/    

var QuestionList = React.createClass({

    componentDidMount: function() {

        var questionListContainer = $(this.getDOMNode());

        var toggleAllPreviews = function (event) {
              //ToDO: implement change of image
              var questionPreviews = $(event.target).closest('table').find('.question-preview');
              var chevronIcon =  $(event.target).closest('th').find('.glyphicon');
              $(chevronIcon).toggleClass('glyphicon-chevron-right').toggleClass('glyphicon-chevron-down');
              if($(chevronIcon).hasClass('glyphicon-chevron-down')) {
                  $.each(questionPreviews, function(index, value) {
                  expandPreview($(value).closest('td'));
                  });
              }
              else {
                  $.each(questionPreviews, function(index, value) {
                  collapsePreview($(value).closest('td'));
                  });
              }
        };

        var toggleInlineHandler = function (event) {
            toggleInline(event.target);
        };

        var toggleInline = function (obj) {
          if ($(obj).closest('td').find('.glyphicon').hasClass('glyphicon-chevron-right')) {
              expandPreview($(obj).closest('td'));
          }
          else {
              collapsePreview($(obj).closest('td'));
          }
        };

        var expandPreview = function (obj) {
            $(obj).find('.glyphicon').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
            $(obj).find('.question-preview').removeClass('preview-collapsed');
        };

        var collapsePreview = function (obj) {
            $(obj).find('.glyphicon').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down');
            $(obj).find('.question-preview').addClass('preview-collapsed');
        };

        questionListContainer.find('.question-table').on('click', '.titles-expander', toggleAllPreviews);
        questionListContainer.find('.question-table').on('click', '.title', toggleInlineHandler);
            
    },

    renderQuestion: function() {
       var specialColumnsCount = 2;
       var self = this;
       var questions = this.props.data.map(function (question) {
            return (<Question metadata={question} columns={self.props.columns}/>);
          });

       if(questions.length==0) {
           questions.push(<QuestionNoDataStub colSpan={this.props.columns.length+specialColumnsCount} />);
        } 

        return questions;
    },

    render: function() {
        return (
          <div className="questionList">
                <table className="table table question-table">
                   <thead>
                    <QuestionListHeader ordering={this.props.order} columns={this.props.columns} allAvailableColumns={this.props.allAvailableColumns}/>
                  </thead>
                  <tbody> 
                    {this.renderQuestion()}
                  </tbody> 
                </table>
          </div>
        );
    }
});