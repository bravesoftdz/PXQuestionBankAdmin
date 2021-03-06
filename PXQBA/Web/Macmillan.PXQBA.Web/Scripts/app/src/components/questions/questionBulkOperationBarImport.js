﻿/**
* @jsx React.DOM
*/ 

var QuestionBulkOperationBarImport = React.createClass({

    backHandler: function() {
       window.location = window.actions.importActions.formTitleStep1Url;
    },

    importHandler: function() {
       var selectedQuestions = this.props.selectedQuestions;
       if(selectedQuestions.length>0) {
           importDataManager.saveQuestionsForImport(this.props.currentCourseId, selectedQuestions).done(this.saveQuestionsForImportDoneHandler);
       }
       else {
           notificationManager.showWarning("You should select questions to continue.");
       }
    },

    saveQuestionsForImportDoneHandler: function (response) {
      debugger;
      var key = response.key;
       window.location = window.actions.importActions.buildfromTitleStep3(key);
    },

    render: function() {
        return ( 
                 <table className="bulk-operation-bar-table">
                          <tr>
                            <td className="bulk-operation-cell">
                              <div className="bulk-operation-item">
                                 <span> {this.props.message}  </span>
                               </div>
                            </td>
                            <td className="bulk-operation-cell">
                              <div className="bulk-operation-item">
                                <button type="button" className="btn btn-primary"  onClick={this.importHandler}>
                                    Import questions to...
                                </button>
                              </div>
                            </td>
                            <td className="bulk-operation-cell">
                              <div className="bulk-operation-item">
                                 <button type="button" className="btn btn-default" onClick={this.backHandler}>
                                     Back
                                  </button>
                              </div>
                            </td>
                          </tr>
                        </table>
            );
        }
});