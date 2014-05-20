/**
* @jsx React.DOM
*/
var ShareMetadataEditorRow = React.createClass({

	getInitialState: function() {

    var field = this.props.field; 
    var isDisabled = false;
    var isUnique = false;
    if (this.props.question.defaultValues == null){
      return ({isDisabled: isDisabled});
    }

    if (field == 'learningObjectives'){

        var localGuids =[];
        $.each(this.props.question.localValues[field], function(i, objective){
           localGuids.push(objective.guid);
       });

        var sharedGuids = [];

          $.each(this.props.question.defaultValues[field], function(i, objective){
           sharedGuids.push(objective.guid);
       });
      return { isDisabled: this.compareArray(localGuids, sharedGuids)};
    }

    if ($.isArray(this.props.question.localValues[field])){
       isDisabled = this.compareArray(this.props.question.localValues[field], this.props.question.defaultValues[field]);

    }else {
      isDisabled = this.props.question.localValues[field] === this.props.question.defaultValues[field];
    }

      if (this.props.isUnique){
        isDisabled = false;
      }
      
      return { isDisabled: isDisabled, isUnique: this.props.isUnique};
    },


   compareArray: function(arr1, arr2) {
    return $(arr1).not(arr2).length == 0 && $(arr2).not(arr1).length == 0;
    },

   renderSharedValue: function(){
        if (this.props.question.defaultValues != null){
             return  (<div className={this.props.isUnique? "cell shared unique" : "cell shared"}>
                     <MetadataFieldEditor question={this.props.question.defaultValues} 
                                           questionId = {this.props.question.id}
                                          editMode={false} 
                                          metadata={this.props.metadata}
                                          editHandler={this.sharedEditHandler} 
                                          applyHandler= {this.applyHandler}
                                          field={this.props.field} 
                                          title={this.props.title} 
                                          isUnique={this.state.isUnique}/>
                 </div>);
        }
    },

    renderSwitchControl: function(){
       if (this.props.question.defaultValues != null && this.state.isUnique != true){
         return  (<div className="cell control">
                     <div className="override-control">
                          <p> </p>
                         <div> Override</div> 
                         <div className="switch-wrapper"><input name="switcher" checked={!this.state.isDisabled} data-size="small" data-on-text="3" data-off-text="2.0.1" type="checkbox" /></div>
                     </div>
                 </div>);
       }
    },

    sharedEditHandler: function(sharedMetadata){
        var question = this.props.question;
        question.defaultValues = sharedMetadata;
        this.props.editHandler(question);
    },

    localEditHandler: function(localMetadata){
        var question = this.props.question;
        question.localValues = localMetadata;
        if (this.props.editHandler !== undefined){
          this.props.editHandler(question);  
        }
        
    },

    renderLocalValue: function(){
      return  (<div className="cell">
                 <MetadataFieldEditor question={this.props.question.localValues} 
                                    isDisabled={this.state.isDisabled} 
                                    metadata={this.props.metadata} 
                                    editHandler={this.localEditHandler} 
                                    field={this.props.field} 
                                    title={this.props.title} />
                 </div>);

    },

    componentDidMount: function(){
    	 this.updateSwitcher();
    },

    toggleState: function(){
      this.setState( {isDisabled: !this.state.isDisabled})
    },

    override: function(){
      this.toggleState();
    },

    restoreField: function(){
        this.setState({isDisabled: true});
        this.restoreLocalQuestion();   
    },

    restoreLocalQuestion: function(){
        var question = this.props.question;
        question.localValues[this.props.field] = question.defaultValues[this.props.field];
        this.props.editHandler(question);
    },

    applyHandler: function(){

        this.restoreLocalQuestion();
        this.setState({isDisabled: true});
        $(this.getDOMNode()).find("[name='switcher']").switchButton({checked: false});
    },

    updateSwitcher: function(){
        $(this.getDOMNode()).find("[name='switcher']").switchButton({labels_placement: 'both', height: 10, on_callback: this.override, off_callback: this.restoreField});
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