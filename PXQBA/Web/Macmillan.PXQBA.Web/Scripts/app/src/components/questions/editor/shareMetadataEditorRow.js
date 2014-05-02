/**
* @jsx React.DOM
*/
var ShareMetadataEditorRow = React.createClass({

	getInitialState: function() {
      return { isOverriden: false};
    },

   renderSharedValue: function(){
        if (this.props.question.sourceQuestion != null){
             return  (<div className="cell">
                     <MetadataFieldEditor question={this.props.question.sourceQuestion} editMode={false} metadata={this.props.metadata} editHandler={this.sourceEditHandler} field={this.props.field} title={this.props.title} />
                 </div>);
        }
    },

    renderSwitchControl: function(){
       if (this.props.question.sourceQuestion != null){
         return  (<div className="cell control">
                      <a href="">Restore</a>
                 </div>);
       }
    },

    sourceEditHandler: function(sourceQuestion){
        var question = this.props.question;
        question.sourceQuestion = sourceQuestion;
        this.props.editHandler(question);
    },

    renderLocalValue: function(){
      return  (<div className="cell">
                 <MetadataFieldEditor question={this.props.question} metadata={this.props.metadata} editHandler={this.props.editHandler} field={this.props.field} title={this.props.title} />
                 </div>);

    },

    render: function() {
    		return(   <div className="row">
                        {this.renderSharedValue()}
                        {this.renderSwitchControl()}
                        {this.renderLocalValue()}
                      </div>
                   );

   }
});