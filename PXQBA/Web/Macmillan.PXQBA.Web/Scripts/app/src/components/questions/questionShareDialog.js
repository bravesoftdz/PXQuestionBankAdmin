/**
* @jsx React.DOM
*/

var QuestionShareDialog = React.createClass({

   
  getInitialState: function() {
      return { 
              waiting: true
             };
    },

  componentDidMount: function(){
          questionDataManager.getMetadataFields(this.props.currentCourseId).done(this.loadMetadata);
        if(this.props.showOnCreate)
        {
           $(this.getDOMNode()).modal("show");
        }
        var closeDialogHandler = this.props.closeDialogHandler;
         $(this.getDOMNode()).on('hidden.bs.modal', function () {
           closeDialogHandler();
        })
    },

    loadMetadata: function(data){
        this.setState({metadata: data, waiting: false});       
    },

    shareQuestion: function(shareViewModel){
        this.setState({waiting: true, shareViewModel: shareViewModel})
        questionDataManager.bulk.shareTitle(this.props.currentCourseId, this.props.questionIds, shareViewModel).done(this.finishShare); 
    },

     getUrlToList: function(titleId, chapterId) {
      return window.actions.questionList.buildQuestionListIndexUrl(titleId, chapterId);
    },

    finishShare: function(response){

           if (response.draftSkipped > 0) {
                notificationManager.showWarning(response.draftSkipped + " drafts were skipped");
            }

            var questionsShared = this.props.questionIds.length - response.draftSkipped;

         if(questionsShared != 0)  {

            var message = questionsShared ==1 ?
                         "Question was shared successfully. This question may require metadata editing." : 
                          questionsShared + " question were shared successfully. These questions may require metadata editing. ";
            var url = this.getUrlToList(this.state.shareViewModel[window.consts.targetProductCourse][0]);
            var link = '<a href='+url+'>Go to the target title </a>'
 
          notificationManager.showSuccessHtml(message+link);
         } 


        this.props.closeDialogHandler();
        questionDataManager.resetState(); 
    },

     getUrlToList: function(titleId, chapterId) {
      return window.actions.questionList.buildQuestionListIndexUrl(titleId, chapterId)
    },
 
    closeHandler: function(){
         $(this.getDOMNode()).modal("hide");
    },
   
    render: function() {
       var self = this;
        var renderHeaderText = function() {
            if(self.props.questionIds.length>1){
                return "Share questions";
            }
            return "Share question";
        };

      
        var renderBody = function(){
          if (self.state.waiting){
            return (<div> <div className="waiting" /></div>);
          }

            return (<div>

                        <ShareQuestionBox metadata={self.state.metadata} shareHandler={self.shareQuestion} closeDialogHandler={self.closeHandler} currentTitle={self.props.currentTitle}/>
                    </div>
            );
        };

   

        return (<ModalDialog renderHeaderText={renderHeaderText} renderBody={renderBody}  dialogId="shareQuestionModal"/>);
    }
});

var ShareQuestionBox = React.createClass({

 
   getInitialState: function() {
      return { 
               shareViewModel: {},
               metadata: this.props.metadata,
               setDefaults: true,
               loading: false
             };
    },


   editHandler: function(question){

    this.setState({shareViewModel: question});
   },

   productTitleEditHandler: function(shareViewModel){

     this.setState({loading: true});
     //In some case questionMetadataEditor return not array
     if(typeof shareViewModel[window.consts.targetProductCourse] === 'string' ) {
        shareViewModel[window.consts.targetProductCourse]=[shareViewModel[window.consts.targetProductCourse]];
     }

     questionDataManager.getCourseMetadata(shareViewModel[window.consts.targetProductCourse][0]).done(this.changeCourseMetadata.bind(this, shareViewModel[window.consts.targetProductCourse][0]));
   },

    getMetaField: function(field, metadata){
      
      var metadataField = this.state.metadataField;
      var question = this.props.question;
     
       return metadataField.length>0 ? metadataField[0]: null;
     },

   getShareViewModel: function(metadata, courseId){
     var shareViewModel = this.state.shareViewModel;
     shareViewModel[window.consts.targetProductCourse]=[courseId];

     var chapterMeta = this.getMetaField(window.consts.questionChapterName, metadata);
     var bankMeta = this.getMetaField(window.consts.questionBankName, metadata);

     shareViewModel[window.consts.questionBankName] = [this.getDefaultValue(bankMeta)];
     shareViewModel[window.consts.questionChapterName] = [this.getDefaultValue(chapterMeta)];

     return shareViewModel;
   },

   getDefaultValue: function(metadataField){
      var defaultValue = "";

      if(metadataField==null) {
        return defaultValue;
      }
       var availableChoices = metadataField.editorDescriptor.availableChoice;

       defaultValue = metadataField.editorDescriptor.availableChoice[0].value;

      return defaultValue
   },

    getMetaField: function(field, metadata){
       var metadataField = $.grep(metadata, function(e){ return $.inArray(e.metadataName, [field, "dlap_q_"+field, "dlap_"+field, field.toLowerCase()])!=-1;  });    
       return metadataField.length>0 ? metadataField[0]: null;
     },

   changeCourseMetadata: function(courseId, metadata){
                    
      var shareViewModel = this.getShareViewModel(metadata, courseId);
      this.setState({
               shareViewModel: shareViewModel,
               metadata: metadata,
               setDefaults: false,
               loading: false
      });
   },
    shareQuestion: function(){
      this.props.shareHandler(this.state.shareViewModel);
   } ,
    renderWaiter: function(){
        if (this.state.loading){
           return (<div className="waiting small"></div>);
        }

        return (<div></div>);
    },




    render: function() {

           var metadataField = this.getMetaField( window.consts.targetProductCourse, this.state.metadata);



          if (metadataField == null  || 
              metadataField.editorDescriptor.availableChoice.length == 0 || 
              (metadataField.editorDescriptor.availableChoice.length == 1 &&   metadataField.editorDescriptor.availableChoice[0].text == this.props.currentTitle)){
            return (<div>There are no titles to share with <br/><br/></div>)
          }


            return (<div>
                           
                           <MetadataFieldEditor question={this.state.shareViewModel} metadata={this.state.metadata} setDefault={this.state.setDefaults} editHandler={this.productTitleEditHandler} field={window.consts.targetProductCourse} excludeValue={this.props.currentTitle}/>
                           {this.renderWaiter()}
                           <MetadataFieldEditor question={this.state.shareViewModel} metadata={this.state.metadata} setDefault={true} defaultType={window.enums.editorType.singleSelect} isDisabled={this.state.loading} reload={true} editHandler={this.editHandler} field={window.consts.questionChapterName} title={"Target chapter"}/>
                           <MetadataFieldEditor question={this.state.shareViewModel} metadata={this.state.metadata} setDefault={true} defaultType={window.enums.editorType.singleSelect} isDisabled={this.state.loading}  reload={true} editHandler={this.editHandler} field={window.consts.questionBankName} title={"Target bank"}/>

                            <div className="modal-footer clearfix">
                                 <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.props.closeDialogHandler}>Cancel</button>
                                 <button type="button" className="btn btn-primary" data-dismiss="modal"  onClick={this.shareQuestion}>Share</button>
                            </div>
                   </div>
               );
    }
});