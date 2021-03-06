/**
* @jsx React.DOM
*/ 

var QuestionListHeader = React.createClass({

  initializationHeaderCells: function(ordering) {
    var columns = this.props.columns;
     
    return this.applyOrdering(columns, ordering);
  },

  selectAllQuestionHandler: function(event) {
    var isSelected = event.target.checked;
    this.props.selectAllQuestionHandelr(isSelected);
  },

  applyOrdering: function(columns, ordering) {
    if(ordering.orderType!=window.enums.orderType.none) {
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
      return (<QuestinListHeaderCell 
                  width={descriptor.width} 
                  caption={descriptor.friendlyName}
                  metadataName={descriptor.metadataName}
                  order={descriptor.order}
                  canNotDelete={descriptor.canNotDelete} 
                  expandAllQuestionHandler={this.props.expandAllQuestionHandler}
                  expandedAll={this.props.expandedAll}
                  canViewPreview={this.props.canViewPreview} />);
  },

  render: function() {
    var cells = this.initializationHeaderCells(this.props.ordering);
    var renderedCell = cells.map(this.renderCell);
    
    return ( 
        <tr>
            <th className="grouped-header"> </th>
            <th style={ {width:'5%'}}> <input type="checkbox" checked={this.props.selectedAll} onChange={this.selectAllQuestionHandler} /></th>
             {renderedCell}
            <th> <QuestionListColumnAppender displayedFields={this.props.columns} 
                                             allFields={this.props.allAvailableColumns}  /></th>
        </tr>
      );
    }
});

