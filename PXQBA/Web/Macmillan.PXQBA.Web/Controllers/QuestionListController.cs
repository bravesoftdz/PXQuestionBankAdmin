﻿using System;
using System.IO;
using System.Text;
using System.Web;
using System.Web.Mvc.Html;
using AutoMapper;
using System.Net;
using Macmillan.PXQBA.Business.Contracts;
using Macmillan.PXQBA.Business.Models;
using Macmillan.PXQBA.Common.Helpers;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic;
using System.Web.Mvc;
using Macmillan.PXQBA.Web.Helpers;
using Macmillan.PXQBA.Web.ViewModels;
using Macmillan.PXQBA.Web.ViewModels.Pages;
using Question = Macmillan.PXQBA.Business.Models.Question;

namespace Macmillan.PXQBA.Web.Controllers
{
    public class QuestionListController : MasterController
    {
        private readonly IQuestionManagementService questionManagementService;
        private readonly IQuestionMetadataService questionMetadataService;
        private readonly INotesManagementService notesManagementService;
        private readonly IProductCourseManagementService productCourseManagementService;

        private readonly int questionPerPage;

        public QuestionListController(IQuestionMetadataService questionMetadataService,
                                      IQuestionManagementService questionManagementService,
                                      INotesManagementService notesManagementService, IProductCourseManagementService productCourseManagementService)
        {
            this.questionManagementService = questionManagementService;
            this.questionPerPage = ConfigurationHelper.GetQuestionPerPage();
            this.questionMetadataService = questionMetadataService;
            this.notesManagementService = notesManagementService;
            this.productCourseManagementService = productCourseManagementService;
        }

        public ActionResult Index(string titleId , string chapterId)
        {
            QuestionListViewModel viewModel = new QuestionListViewModel()
                                              {
                                                  CourseId = titleId,
                                                  ChapterId = chapterId
                                              };
            UpdateCurrentCourse(titleId);
            return View(viewModel);
        }

        [HttpPost]
        public ActionResult GetQuestionData(QuestionListDataRequest request)
        {

            var currentCourseFilter = request.Filter.SingleOrDefault(x => x.Field == MetadataFieldNames.ProductCourse);
            ClearParameters(currentCourseFilter, request);

            UpdateCurrentCourse(currentCourseFilter.Values.First());

            var sortCriterion = new SortCriterion {ColumnName = request.OrderField, SortType = request.OrderType};
            var questionList = questionManagementService.GetQuestionList(CourseHelper.CurrentCourse, request.Filter, sortCriterion, 
                                                                          (request.PageNumber - 1) * questionPerPage,
                                                                          questionPerPage);

            
            var totalPages = (questionList.TotalItems + questionPerPage - (questionList.TotalItems % questionPerPage)) /
                             questionPerPage;

            var response = new QuestionListDataResponse
                        {
                            Filter = request.Filter,
                            TotalPages = totalPages,
                            QuestionList = questionList.CollectionPage.Select(q => Mapper.Map<QuestionMetadata>(q, opt => opt.Items.Add(CourseHelper.CurrentCourse.ProductCourseId, CourseHelper.CurrentCourse))),
                            PageNumber = request.PageNumber,
                            Columns = questionMetadataService.GetDataForFields(CourseHelper.CurrentCourse, request.Columns).Select(MetadataFieldsHelper.Convert).ToList(),
                            AllAvailableColumns = questionMetadataService.GetAvailableFields(CourseHelper.CurrentCourse).Select(MetadataFieldsHelper.Convert).ToList(),
                            Order = new QuestionOrder()
                                    {
                                        OrderField = request.OrderField,
                                        OrderType = request.OrderType.ToString().ToLower()
                                    },
                            QuestionCardLayout = questionMetadataService.GetQuestionCardLayout(CourseHelper.CurrentCourse),
                            ProductTitle = CourseHelper.CurrentCourse.Title
                        };

            return JsonCamel(response);
        }

        /// <summary>
        /// Gets notes attached to the question by question id
        /// </summary>
        /// <param name="questionId"></param>
        /// <returns></returns>
        public ActionResult GetQuestionNotes(string questionId)
        {
            return JsonCamel(notesManagementService.GetQuestionNotes(questionId));
        }

        /// <summary>
        /// Save new question note
        /// </summary>
        /// <param name="note"></param>
        [HttpPost]
        public ActionResult CreateQuestionNote(Note note)
        {
              return JsonCamel(notesManagementService.CreateNote(note));
        }

        /// <summary>
        /// Delete question note
        /// </summary>
        /// <param name="note"></param>
        [HttpPost]
        public ActionResult DeleteQuestionNote(Note note)
        {
            notesManagementService.DeleteNote(note);
            return JsonCamel(new { isError = false });
        }

        /// <summary>
        /// Save new question note
        /// </summary>
        /// <param name="note"></param>
        [HttpPost]
        public ActionResult SaveQuestionNote(Note note)
        {
          notesManagementService.SaveNote(note);
          return JsonCamel(new { isError = false });
        }


        /// <summary>
        /// Check filtration and reset if title was changed
        /// </summary>
        /// <param name="courseFilterDescriptor"></param>
        /// <param name="request"></param>
        private void ClearParameters(FilterFieldDescriptor courseFilterDescriptor, QuestionListDataRequest request)
        {
            if (!CourseHelper.IsResetParameterNeeded(courseFilterDescriptor))
            {
                return;
            }

            var courseFilter = request.Filter.SingleOrDefault(f => f.Field == courseFilterDescriptor.Field);
            request.Filter = new List<FilterFieldDescriptor>()
                             {
                                 courseFilter
                             };

            request.PageNumber = 1;
            request.OrderField = null;
            request.OrderType = SortType.None;
        }

        /// <summary>
        /// Update current course in session
        /// </summary>
        /// <param name="courseId"></param>
        private void UpdateCurrentCourse(string courseId)
        {
            if (CourseHelper.NeedGetCourse(courseId))
            {
                CourseHelper.CurrentCourse = productCourseManagementService.GetProductCourse(courseId, true);
            }
        }

        /// <summary>
        /// Gets metadata for course by its Id
        /// </summary>
        /// <param name="courseId"></param>
        /// <returns></returns>
        public ActionResult GetMetadataForCourse(string courseId)
        {
            Course course = null;
            if (CourseHelper.CurrentCourse.ProductCourseId == courseId)
            {
                course = CourseHelper.CurrentCourse;
            }
            if (course == null)
            {
                course = productCourseManagementService.GetProductCourse(courseId);
            }

            if (course == null)
            {
                return JsonCamel(questionMetadataService.GetAvailableFields(CourseHelper.CurrentCourse).Select(MetadataFieldsHelper.Convert).ToList());
            }
            return JsonCamel(questionMetadataService.GetAvailableFields(course).Select(MetadataFieldsHelper.Convert));
        }


     


    }

}
