/**
* @jsx React.DOM
*/

var ModalDialog = React.createClass({


    componentDidMount: function(){
         if(typeof this.props.closeDialogHandler !== 'undefined' &&
            !(this.props.isMainEditor != undefined && this.props.isMainEditor)){
            var self = this;
            $(this.getDOMNode()).on('hidden.bs.modal', function (e) {
                self.props.closeDialogHandler();
            });
        }
       

        if (this.props.showOnCreate){
            $(this.getDOMNode()).modal('show');
        }

        if(this.props.setInnerHtml){
            $(this.getDOMNode()).find(".modal-body").html(this.props.innerHtml);
        }
    },

    closeDialog: function(){
         if(this.props.preventDefaultClose || (this.props.isMainEditor != undefined && this.props.isMainEditor)){
             this.props.closeDialogHandler();
         } else {
             $(this.getDOMNode()).modal('hide'); 
         }
    },

    render: function() {
        return (
            <div className="modal fade" id={this.props.dialogId} tabIndex="-1" role="dialog" data-backdrop="static"  aria-labelledby="addQuestionModalLabel" aria-hidden="true" >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={this.closeDialog}>&times;</button>
                            <h4 className="modal-title" id="myModalLabel">{this.props.renderHeaderText()}</h4>
                        </div>
                        <div className="modal-body" >
                            {this.props.setInnerHtml? "" :this.props.renderBody()}
                        </div>
                       
                      {(this.props.renderFooterButtons !== undefined) ? this.props.renderFooterButtons() :""}
                    
                    </div>
                </div>
            </div>
            );
    }
});
