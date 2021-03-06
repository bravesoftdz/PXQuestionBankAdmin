﻿/**
* @jsx React.DOM
*/

var MetadataCourseSelector= React.createClass({
  
    buildAllOptions: function() {
      var allOptions = [];
      for(var i=0; i<this.props.availableCourses.length; i++) {
        allOptions.push({
          value: this.props.availableCourses[i].id,
          text: this.props.availableCourses[i].title
        })
      }

      return allOptions;
    },

    getCurrentValues: function() {
        if(this.props.currentCourse!=null) {
          return [this.props.currentCourse];
        }
        return [];
    },

    renderLabel: function() {
      if(this.props.hideLabel) {
        return null;
      }
       return (<div> Title </div>);
    },

    render: function() {
       return (

               <div className="course-selector-container"> 
                    {this.renderLabel()}
                   <div> 
                      <SingleSelectSelector 
                        allOptions={this.buildAllOptions()}
                        dataPlaceholder="No Title"
                        onChangeHandler={this.props.selectCourseHandler}
                        currentValues = {this.getCurrentValues()}
                      />
                    </div>
                </div>
            );
    }
});




