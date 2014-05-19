﻿/**
* @jsx React.DOM
*/ 

var Question = React.createClass({

    getInitialState: function() {
        return { showMenu: false, expanded: false};
    },

    mouseOverHandler: function() {
        this.setState({ showMenu: true });
    },

    mouseLeaveHandler: function() {
        this.setState({ showMenu: false });
    },

    renderMenu: function() {
            var questionId = this.props.metadata.data["id"];
            var questionIds = [];
            questionIds.push(questionId);

            var isShared = true;

            if(this.props.metadata.data.sharedWith==null) {
                isShared = false;
            }
            else {
                isShared =  this.props.metadata.data.sharedWith != "";
            }

            var titleCount=0;
            if(isShared) {
               titleCount = this.props.metadata.data.sharedWith.split("<br />").length;
            }

            return <QuestionListMenu
                        data={this.props.metadata.data} 
                        copyQuestionHandler={this.props.menuHandlers.copyQuestionHandler.bind(null, questionId)}
                        editQuestionHandler={this.props.menuHandlers.editQuestionHandler.bind(null, questionId)}
                        editNotesHandler={this.props.menuHandlers.editNotesHandler.bind(null, questionId)}
                        shareHandler ={this.props.menuHandlers.shareHandler.bind(null, questionIds)}
                        showAll = {this.state.showMenu} 
                        isShared = {isShared}
                        titleCount = {titleCount} />
    },

    selectQuestionHandler: function(event) {
        var quesionId = this.props.metadata.data.id;
        var isSelected = event.target.checked;
        this.props.selectQuestionHandler(quesionId, isSelected);
    },

    renderCell: function(metadataName, editorDescriptor, allowedEdit) {
        return ( <QuestionCell value={this.props.metadata.data[metadataName]}
                               field={metadataName} 
                               questionId={this.props.metadata.data.id}
                               editorDescriptor={editorDescriptor}
                               allowedEdit = {allowedEdit}
                               expanded = {this.props.expanded}
                               expandPreviewQuestionHandler = {this.props.expandPreviewQuestionHandler} />);
    },

    render: function() {
        var self = this;
        var componentClass = React.addons.classSet({
                'question': true,
                'hover': this.state.showMenu,
                'question-selected': this.props.selected
            });
        
        var cells = this.props.columns.map(function(descriptor) {
                return self.renderCell(descriptor.metadataName, descriptor.editorDescriptor, descriptor.isInlineEditingAllowed)
            });

        return ( 
            <tr className={componentClass} 
                    onMouseOver={this.mouseOverHandler}
                    onMouseLeave={this.mouseLeaveHandler}>
                <td> 
                    <input type="checkbox" checked={this.props.selected} onChange={this.selectQuestionHandler}/>
                </td>
                 {cells}
                 <td className="actions">  
                   <div className="actions-container">
                        {this.renderMenu()}
                   </div>
                </td>  
            </tr> 
            );
        }
});