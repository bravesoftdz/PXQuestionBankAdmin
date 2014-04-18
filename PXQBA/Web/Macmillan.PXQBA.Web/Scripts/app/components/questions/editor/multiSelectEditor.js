/**
* @jsx React.DOM
*/
var MultiSelectEditor = React.createClass({displayName: 'MultiSelectEditor',

 
    getInitialState: function(){
         var metadataValues = [];
         var currentValues = this.props.question[this.props.field];
     
        var  availableChoices =  this.props.metadataField.editorDescriptor.availableChoice;

        for (var propertyName in availableChoices) {
            availableChoice = availableChoices[propertyName];
            metadataValues.push(availableChoice);
        }

        if(currentValues !== undefined && currentValues != null && currentValues.length>0){
          $.merge(metadataValues, currentValues);
        }
      
        metadataValues = this.unique(metadataValues);
        var options = [];
         $.each(metadataValues, function(i, option){
               options.push(React.DOM.option( {value:option}, option));
         });

         return ({options: options});

    },

    unique: function(list) {
        var result = [];
        $.each(list, function(i, e) {
            if ($.inArray(e, result) == -1) result.push(e);
        });
        return result;
    },


     editHandler: function(selectedOptions){
      
       
       var items = [];
       
       $.each(selectedOptions, function(i, option){
          items.push(option.text);
       });
      

      var question = this.props.question;
      if (question[this.props.field]== null || question[this.props.field].length !== items.length)
      {
        question[this.props.field] = items;
        this.props.editHandler(question);
      }
     

     },

    renderMenuItems: function() {

        return (this.state.options);
    },


    componentDidMount: function(){
        var selector = this.getDOMNode();
        var chosenOptions = {width: "100%", hide_dropdown: false, allow_add_new_values: this.props.metadataField.canAddValues};
  
        var handler =  this.editHandler;
        $(selector).val(this.props.question[this.props.field])
                   .chosen(chosenOptions)
                   .change(function(e, params){
                             handler(e.currentTarget.selectedOptions);
                    });

                         
    },

   
    render: function() {
        return (
             React.DOM.select( {'data-placeholder':"No Value", multiple:true}, 
                    this.renderMenuItems()  
             ) 
         );
    }
});