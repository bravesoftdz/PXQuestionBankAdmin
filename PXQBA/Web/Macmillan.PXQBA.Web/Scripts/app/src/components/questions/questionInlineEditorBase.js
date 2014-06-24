﻿/**
* @jsx React.DOM
*/ 

var QuestionInlineEditorBase = React.createClass({
    
    componentDidMount: function() {
        $(document).click(this.clickOutSideControlHandler);
    },

    componentWillUnmount: function() {
        $(document).unbind( "click", this.clickOutSideControlHandler);
    },

    clickOutSideControlHandler: function(event) {
        if($(event.target).parents().index($('.inline-editor-container')) == -1) {
               this.props.afterEditingHandler();
        }
    },

    saveVelueHandler: function(value) {
        if(value != null) {
          questionDataManager.saveQuestionData(this.props.metadata.questionId,
                                               this.props.metadata.field,
                                               value);
 
        }
        this.props.afterEditingHandler();
    },

    getAvailibleValues: function() {
        if(this.props.metadata.field==window.consts.questionStatusName) {
          return this.getAvailibleValuesForStatus();
        }
        
        return this.props.metadata.editorDescriptor.availableChoice;
    },

    getAvailibleValuesForStatus: function() {
      //  if(!this.props.metadata.draft) {
      //    return this.props.metadata.editorDescriptor.availableChoice;
      //  }

        var newValues = [];

        for(var i=0; i<this.props.metadata.editorDescriptor.availableChoice.length; i++) {
           // if(this.props.metadata.editorDescriptor.availableChoice[i].value!=window.enums.statusesId.availibleToInstructor) {
           //   newValues.push(this.props.metadata.editorDescriptor.availableChoice[i]);
           // }

            if (this.props.metadata.editorDescriptor.availableChoice[i].text == this.props.metadata.status){
                newValues.push(this.props.metadata.editorDescriptor.availableChoice[i]);
                continue;
            } 

            var statusValue = this.props.metadata.editorDescriptor.availableChoice[i].value;

            if (this.props.metadata.status == window.enums.statuses.availibleToInstructor){

              if(statusValue==window.enums.statusesId.deleted && this.props.capabilities.canChangeFromAvailibleToDeleted){
                 newValues.push(this.props.metadata.editorDescriptor.availableChoice[i]);
              }

              if(statusValue==window.enums.statusesId.inProgress && this.props.capabilities.canChangeFromAvailibleToInProgress){
                   newValues.push(this.props.metadata.editorDescriptor.availableChoice[i]);
              }
              continue;
            }

             if (this.props.metadata.status == window.enums.statuses.deleted ){

               if(statusValue==window.enums.statusesId.availibleToInstructor && this.props.capabilities.canChangeFromDeletedToAvailible){
                   newValues.push(this.props.metadata.editorDescriptor.availableChoice[i]);
               }

              if(statusValue==window.enums.statusesId.inProgress && this.props.capabilities.canChangeFromDeletedToInProgress){
                 newValues.push(this.props.metadata.editorDescriptor.availableChoice[i]);
              }
               continue;
            }

             if (this.props.metadata.status == window.enums.statuses.inProgress){

             if(statusValue==window.enums.statusesId.availibleToInstructor && this.props.capabilities.canChangeFromInProgressToAvailible){
                 newValues.push(this.props.metadata.editorDescriptor.availableChoice[i]);
              }
               if(statusValue==window.enums.statusesId.deleted && this.props.capabilities.canChangeFromInProgressToDeleted){
                 newValues.push(this.props.metadata.editorDescriptor.availableChoice[i]);
              }
               continue;
            }

             newValues.push(this.props.metadata.editorDescriptor.availableChoice[i]);
        }

        return newValues;
    },

    renderSpecificEditor: function() {
        switch (this.props.metadata.editorDescriptor.editorType) {
          case window.enums.editorType.text:
            return (<QuestionInlineEditorText saveVelueHandler={this.saveVelueHandler} 
                    afterEditingHandler={this.props.afterEditingHandler}
                    metadata={this.props.metadata}/>);
          case window.enums.editorType.singleSelect:
            return (<QuestionInlineEditorSingleSelect saveVelueHandler={this.saveVelueHandler} 
                        afterEditingHandler={this.props.afterEditingHandler}
                        metadata={this.props.metadata}
                        values={this.getAvailibleValuesForStatus()} />);
          case window.enums.editorType.number:
            return (<QuestionInlineEditorNumber saveVelueHandler={this.saveVelueHandler} 
                       afterEditingHandler={this.props.afterEditingHandler}
                       metadata={this.props.metadata} />);
          default:
            return null;
        }
    },

     render: function() {
        return ( 
            <div className='inline-editor-container'>
               {this.renderSpecificEditor()}
            </div>
            );
     }

});