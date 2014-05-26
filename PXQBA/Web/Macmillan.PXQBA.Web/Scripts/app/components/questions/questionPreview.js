/**
* @jsx React.DOM
*/ 

var QuestionPreview = React.createClass({displayName: 'QuestionPreview',

      
        reloadPreview: function(){
            $(this.getDOMNode()).find(".question-preview-container").html(this.props.preview);
        },
       componentDidUpdate: function(){
            this.reloadPreview();
       },

       componentDidMount: function(){
          this.reloadPreview();
       },
       compileTemplate: function(){

            var template = Handlebars.compile(this.props.questionCardTemplate);
            var html = template(this.props.metadata);
            return html;
       },
        render: function() {
            return ( 
                  React.DOM.tr(null, 
                    React.DOM.td( {colSpan:this.props.colSpan}, 
                       React.DOM.div( {className:"question-preview-container"}),
                         React.DOM.hr(null ),
                         React.DOM.div( {className:"question-card-template", dangerouslySetInnerHTML:{__html: this.compileTemplate()}} )
                    )
                  )
            );
        }
});