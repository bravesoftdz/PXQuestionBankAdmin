﻿/**
* @jsx React.DOM
*/ 

var QuestionCell = React.createClass({displayName: 'QuestionCell',

    getInitialState: function() {
        return { 
                 showMenu: false,
                 editMode: false 
               };
    },

    mouseOverHandler: function() {
      if(!this.state.editMode) {
            this.setState({ showMenu: true});
      }
    },

    mouseLeaveHandler: function() {
        this.setState({ showMenu: false});
    },

    onEditClickHandler: function() {
            this.setState({ 
                        showMenu: false,
                        editMode: true
                       });
    },

    renderMenu: function() {
        if(this.state.showMenu) {
            if((this.props.editorDescriptor.editorType==window.enums.editorType.none)||
              (!this.props.allowedEdit)) {
                return null;
            }
            return QuestionCellMenu( {onEditClickHandler:this.onEditClickHandler} )
        }
        return null;
    },


    afterEditingHandler: function(){
         this.setState({ 
                        showMenu: false,
                        editMode: false
                      });
    },

    expandPreviewQuestionHandler: function(expanded) {
       this.props.expandPreviewQuestionHandler(this.props.questionId, expanded)
    },

    renderExpandButton: function() {
     if(this.props.field==window.consts.questionTitleName) {
         return (ExpandButton( {expanded:this.props.expanded, onClickHandler:this.expandPreviewQuestionHandler}));  
      }
      return null;
    },

    renderValue: function() {
        if(this.state.editMode) {
            return (QuestionInlineEditorBase( {afterEditingHandler:this.afterEditingHandler,
                    metadata: {field: this.props.field,
                               currentValue: this.props.value,
                               questionId:  this.props.questionId,
                               editorDescriptor: this.props.editorDescriptor}}
             ));
        }
        return (React.DOM.div( {className:"cell-value"}, this.renderExpandButton(),this.props.value, " " ));
    },

    render: function() {
          var cellClass = React.addons.classSet({
                 'cell-edit-mode': this.state.editMode
            });

        return ( 
                React.DOM.td( {onMouseOver:this.mouseOverHandler,
                    onMouseLeave:this.mouseLeaveHandler,
                    className:cellClass}
                    , 

                    React.DOM.table(null, 
                        React.DOM.tr(null, 
                            React.DOM.td(null, 
                            this.renderValue()
                            ),
                            React.DOM.td( {className:"cell-menu-holder"}, 
                                 this.renderMenu()
                            )
                        )
                    )
                )
            );
        }
});