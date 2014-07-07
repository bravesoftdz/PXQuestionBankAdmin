﻿/**
* @jsx React.DOM
*/

var TitlePage = React.createClass({displayName: 'TitlePage',

    getInitialState: function() {
      return { loading: false, response: this.props.response, showAddRepoDialog: false};
    },

    renderAddRepoDialog: function(){
      if(this.state.showAddRepoDialog){
        return (AddRepositoryDialog(  {titles: this.props.response.titles, closeDialogHandler:this.closeDialogHandler, addNewRepository:this.addNewRepository}))
      }

      return null;

    },

    showAddRepoDialog: function(){
      this.setState({showAddRepoDialog: true});
    },

    closeDialogHandler: function(){
      this.setState({showAddRepoDialog: false});
    },


    addNewRepository: function(name){
      this.setState({loading:true, showAddRepoDialog: false});
      var self=this;
      titleDataManager.addNewRepository(name).done(function(){
        notificationManager.showSuccess("Draft repository successfully created");
        titleDataManager.getTitles().done(self.setTitles).error(self.handlerErrors);
      }).error(self.handlerErrors);
    },

    handlerErros: function(e){
         notificationManager.showSuccess("Error occured, please, try again later");
          this.setState({loading: false});
    },
  
  setTitles: function(response){
    this.setState({response: response, loading: false, showAddRepoDialog: false})
  } ,

    render: function() {
       return (
                React.DOM.div(null, 
                 React.DOM.button( {className:"btn btn-primary add-repository", onClick:this.showAddRepoDialog}, 
                           "Add repository"
                        ),
               React.DOM.h2(null,  " Titles available:"),        

                     TitleList( {data:this.state.response.titles} ),
                     this.state.loading? Loader(null ) : "",
                     this.renderAddRepoDialog()
                )
            );
    }
});

var AddRepositoryDialog  = React.createClass({displayName: 'AddRepositoryDialog',

   getInitialState: function(){
       return({titles: this.props.titles, newRepoName: ""});
   },


  dataChangeHandler: function(name){
      this.setState({newRepoName: name})
  },

  addRepository: function(){
    var newRepoName = this.state.newRepoName;
    if(newRepoName==""){
      notificationManager.showWarning("Please, enter repository name");
      return;
    }
   
    var existingNames = [];
    existingNames = $.grep(this.props.titles, function(el){
      return el.title == newRepoName;
    });

    if(existingNames.length > 0){
      notificationManager.showWarning("This name already exist");
      return;
    }
    this.props.addNewRepository(this.state.newRepoName);
    $(this.getDOMNode()).modal("hide");
  },

   closeDialog: function(){

        this.props.closeDialogHandler();
   },  

 render: function() {
        
           var self = this;
        var renderHeaderText = function() {
            
            return "Add repository";
        };

      
        var renderBody = function(){
      

            return (React.DOM.div(null, 
                      React.DOM.p(null, "Enter repository name:"),
                     TextEditor( {dataChangeHandler:self.dataChangeHandler, value:self.state.newRepoName})
                    )
            );
        };




          var  renderFooterButtons = function(){

                   return (React.DOM.div( {className:"modal-footer"},  
                             React.DOM.button( {type:"button", className:"btn btn-primary", onClick:self.addRepository}, "Save"),
                             React.DOM.button( {type:"button", className:"btn btn-default", 'data-dismiss':"modal"}, "Close")
                          ));
             
                 };
 

        return (ModalDialog(  {showOnCreate:  true, 
                              renderHeaderText:renderHeaderText, 
                              renderBody:renderBody,  
                              closeDialogHandler:  this.closeDialog, 
                              renderFooterButtons:renderFooterButtons, 
                              dialogId:"addRepoDialogId"}));
    }
});







