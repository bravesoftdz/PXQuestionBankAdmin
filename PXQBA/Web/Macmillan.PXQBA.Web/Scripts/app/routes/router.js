﻿var questionContainer = $('#question-container')[0];

crossroads.addRoute('/page/{page}/columns/{columns}/filter/{query}/needRerender/{needRerender}/order/{orderType}/:orderField:',
    function (page, columns, query, needRerender, orderType, orderField) {
        console.log('route callback executed');
        routsManager.setState(query, page, columns, orderType, orderField);
        asyncManager.startWait(questionContainer);
        var questionsData = questionDataManager.getQuestionsByQuery(filterHashParameterHelper.parse(query),
                                                                    page,
                                                                    columnHashParameterHelper.parse(columns),
                                                                    orderType,
                                                                    orderField,
                                                                    needRerender);
        questionsData.done(function (response) {

            routsManager.copyAndApplyState(response.filter,
                                            response.pageNumber,
                                            response.order.orderType,
                                            response.order.orderField);
            
            asyncManager.page = React.renderComponent(
                QuestionListPage({
                    response: response,
                    mode: window.questionPageParameters.mode
                }, " "),
                questionContainer);
             })
            .fail(function(error) {
                console.error("getQuestionsBy:", error);
            })
            .always(function() {
                asyncManager.stopWait();
            });
    });

crossroads.addRoute('', function () {
    asyncManager.startWait(questionContainer);

    window.routsManager.query.setValue(
        filterHashParameterHelper.addFiltration(
            window.consts.questionCourseName, [window.questionPageParameters.currentCourseId], window.routsManager.query.getValue()));
    
    window.routsManager.query.setValue(
    filterHashParameterHelper.addFiltration(
        window.consts.containsTextName, [], window.routsManager.query.getValue()));

    if (window.questionPageParameters.currentChapterId != '') {
        window.routsManager.query.setValue(
             filterHashParameterHelper.addFiltration(
                window.consts.questionChapterName, [window.questionPageParameters.currentChapterId], window.routsManager.query.getValue()));
    }

    hasher.setHash(window.routsManager.buildHash());
});

//setup hasher
function parseHash(newHash, oldHash) {
    crossroads.parse(newHash);
}
hasher.initialized.add(parseHash); //parse initial hash
hasher.changed.add(parseHash); //parse hash changes
hasher.init(); //start listening for history change

