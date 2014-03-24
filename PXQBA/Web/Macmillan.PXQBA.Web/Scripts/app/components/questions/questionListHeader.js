/**
* @jsx React.DOM
*/ 

var QuestionListHeader = React.createClass({displayName: 'QuestionListHeader',

  initializationHeaderCells: function(ordering) {
    var columns = this.props.columns;
     
    return this.applyOrdering(columns, ordering);
  },

  applyOrdering: function(columns, ordering) {
    if(ordering.orderType!='none') {
      for(var i=0; i<columns.length; i++) {
        if(columns[i].metadataName==ordering.orderField) {
           columns[i].order=ordering.orderType;
           break;
        }
      }
    }
    
    return columns;
  },

  renderCell: function(descriptor) {
      return (QuestinListHeaderCell( 
                  {width:descriptor.width, 
                  caption:descriptor.friendlyName,
                  metadataName:descriptor.metadataName,
                  order:descriptor.order,
                  leftIcon:descriptor.leftIcon} ));
  },

  render: function() {
    var cells = this.initializationHeaderCells(this.props.ordering);
    var renderedCell = cells.map(this.renderCell);
    return ( 
        React.DOM.tr(null, 
            React.DOM.th( {style: {width:'5%'}},  " ", React.DOM.input( {type:"checkbox"})),
             renderedCell,
            React.DOM.th(null,  " ", QuestionListColumnAppender( {displayedFields:this.props.columns, 
                                             allFields:questionMetadataManager.getQuestionAvailableFields()} ))
        )
      );
    }
});

