﻿/**
* @jsx React.DOM
*/ 

var Question = React.createClass({displayName: 'Question',
	render: function() {
		return ( 
			React.DOM.tr( {className:"question"}, 
				React.DOM.td(null,  
					React.DOM.input( {type:"checkbox"})
				),

				React.DOM.td( {className:"eBookChapter"}, 
					this.props.eBookChapter
				),

				React.DOM.td( {className:"questionBank"}, 
				    this.props.questionBank
				),

				React.DOM.td( {className:"questionSeq"}, 
					this.props.questionSeq
				),

				React.DOM.td( {className:"title"}, 
				    React.DOM.div(null, this.props.title, " " )
				),

				React.DOM.td( {className:"questionType"}, 
					this.props.questionType
				),

			    React.DOM.td( {className:"actions"}  
				
				)  
			) 
			);
		}
});