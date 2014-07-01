﻿/**
* @jsx React.DOM
*/

var CourseComparerRoot = React.createClass({displayName: 'CourseComparerRoot',

   getInitialState: function() {
        return { 
            firstCourse: null,
            secondCourse: null,
            currentPage: null,
            compareEnabled: false
        };
    },

    changeFirstCourseHandler: function(courseId) {
        this.setState({firstCourse: courseId});
        this.getQuestions();

    },

    changeSecondCourseHandler: function(courseId) {
        this.setState({secondCourse: courseId});
        this.getQuestions(0);
    },

    isGetQuestionPossible: function() {
        if(this.state.firstCourse==null) {
            return false;
        }

        if(this.state.secondCourse==null) {
            return false;
        }

        return true;
    },

    getQuestions: function(page) {
        if(!this.isGetQuestionPossible()) {
            return;
        }


        compareTitlesDataManager.getComparedData(this.state.firstCourse, 
                                                 this.state.secondCourse,
                                                 page).done(this.getComparedDataDone);
       

    },

    paginatorClickHandle:function(page) {
        this.getQuestions(page);
    },

    getComparedDataDone: function(response) {

        if(!response.oneQuestionRepositrory) {
            this.setState({compareEnabled: false});
            notificationManager.showWarning("You need choose titles for comparison with the same Question Bank Repository");
            return;
        }

        this.setState({compareEnabled: true});
        this.setState({page: response.page});
        this.setState({questions: response.questions});
        this.setState({totalPages: response.totalPages});
    },

    getCourseCaption: function(courseId) {
        if(courseId==null) {
            return "";
        }

        for(var i=0; i<this.props.availableCourses.length; i++) {
            if(this.props.availableCourses[i].id==courseId) {
                return this.props.availableCourses[i].title;
            }
        }

        return "";
    },

    renderPaginator: function() {
        if(!this.state.compareEnabled) {
            return null;
        }
        return ( Paginator( {metadata:{
                            currentPage: this.state.page,
                            totalPages: this.state.totalPages}, 
                            customPaginatorClickHandle:this.paginatorClickHandle}));
    },

    render: function() {
       return (
            React.DOM.div(null, 
                CourseCompareSelector( {availableCourses:this.props.availableCourses, 
                                       currentFirstCourse:this.state.firstCourse,
                                       currentSecondCourse:this.state.secondCourse,
                                       changeFirstCourseHandler:this.changeFirstCourseHandler,
                                       changeSecondCourseHandler:this.changeSecondCourseHandler}
                ),

                QuestionComparerList( {questions:this.state.questions, 
                                      compareEnabled:this.state.compareEnabled,
                                      firstTitleCaption:this.getCourseCaption(this.state.firstCourse),
                                      secondTitleCaption:this.getCourseCaption(this.state.secondCourse)}
                                      ),
                 this.renderPaginator()
            )
            );
    }
});




