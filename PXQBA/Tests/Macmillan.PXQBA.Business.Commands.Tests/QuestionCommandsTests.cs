﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using AutoMapper.Mappers;
using Bfw.Agilix.Commands;
using Bfw.Agilix.DataContracts;
using Bfw.Agilix.Dlap;
using Bfw.Common.JqGridHelper;
using Macmillan.PXQBA.Business.Commands.Contracts;
using Macmillan.PXQBA.Business.Commands.Helpers;
using Macmillan.PXQBA.Business.Commands.Services.DLAP;
using Macmillan.PXQBA.Business.Contracts;
using Macmillan.PXQBA.Business.Models;
using Macmillan.PXQBA.Business.Services;
using Macmillan.PXQBA.Business.Services.Automapper;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using Course = Macmillan.PXQBA.Business.Models.Course;
using Question = Bfw.Agilix.DataContracts.Question;
using QuestionChoice = Bfw.Agilix.DataContracts.QuestionChoice;

namespace Macmillan.PXQBA.Business.Commands.Tests
{
    [TestClass]
    public class QuestionCommandsTests
    {
        private IContext context;
        private IProductCourseOperation productCourseOperation;
        private IUserOperation userOperation;
        private INoteCommands noteCommands;
        private AutomapperConfigurator automapperConfigurator;
        private IModelProfileService modelProfileService;
        private IQuestionCommands questionCommands;
        private string productCourseId = "12";
        private string twoQuestionsSOLRSearchResultResponse = @" <results>
                                                              <result name=""response"" numFound=""2"" start=""0"" maxScore=""16.067871"" time=""8"">
                                                                <doc entityid=""39768"" class=""question"" questionid=""f13f2cd1-2ddf-430c-85c9-2577a5f009f4"">
                                                                  <str name=""dlap_id"">39768|Q|f13f2cd1-2ddf-430c-85c9-2577a5f009f4</str>
                                                                  <str name=""dlap_class"">question</str>
                                                                    <arr name=""product-course-id-12/bank"">
                                                                    <str>Test Bank</str>
                                                                    </arr>
                                                                    <arr name=""product-course-id-12/chapter"">
                                                                    <str>Test Chapter</str>
                                                                    </arr>
                                                                  <arr name=""score"">
                                                                    <float name=""score"">16.067871</float>
                                                                  </arr>

                                                                   <arr name=""product-course-id-12/sequence"">
                                                                    <float name=""score"">18.38</float>
                                                                  </arr>
                                                                </doc>
                                                                <doc entityid=""39768"" class=""question"" questionid=""4684f693-7997-4dc2-8496-56eb645e47ac"">
                                                                  <str name=""dlap_id"">39768|Q|4684f693-7997-4dc2-8496-56eb645e47ac</str>
                                                                  <str name=""dlap_class"">question</str>
                                                                    <arr name=""product-course-id-12/bank"">
                                                                    <str>Test Bank</str>
                                                                    </arr>
                                                                    <arr name=""product-course-id-12/chapter"">
                                                                    <str>Test Chapter</str>
                                                                    </arr>

                                                                  <arr name=""score"">
                                                                    <float name=""score"">16.067871</float>
                                                                  </arr>
                                                                  <arr name=""product-course-id-12/sequence"">
                                                                    <float name=""score"">18.34</float>
                                                                  </arr>
                                                                </doc>
                                                              </result>
                                                            </results>";

        private const string productCourseSection = @"<product-course-id-12>
<bank>Test Bank</bank>
<chapter>Test Chapter</chapter>
<productcourseid>12</productcourseid>
</product-course-id-12>";

        private const string taskResponse = @"<responses>
                                               <task running=""false"">
                                               
                                                </task> 
                                            </responses>";
        [TestInitialize]
        public void TestInitialize()
        {
            context = Substitute.For<IContext>();
            context.CurrentUser = new UserInfo();
            context.CurrentUser.Id = "633478";

            productCourseOperation = Substitute.For<IProductCourseOperation>();
            questionCommands = new QuestionCommands(context, productCourseOperation);

            userOperation = Substitute.For<IUserOperation>();
            noteCommands = Substitute.For<INoteCommands>();
            modelProfileService = new ModelProfileService(productCourseOperation, questionCommands, userOperation, noteCommands);

            automapperConfigurator = new AutomapperConfigurator(new ModelProfile(modelProfileService));
            automapperConfigurator.Configure();
        }


        [TestMethod]
        public void GetQuestionList_TwoUserFilters_NoQuestions()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(x => ExecuteAsAdminFillNoQuestions(((Search)x))));

            var filter = new List<FilterFieldDescriptor>
                         {
                             new FilterFieldDescriptor()
                             {
                                 Field = MetadataFieldNames.Bank,
                                 Values = new List<string>(){"Bank 1"}
                             },
                             new FilterFieldDescriptor()
                             {
                                 Field = MetadataFieldNames.Chapter,
                                 Values = new List<string>(){"Chapter 1"}
                             }
                         };
            AddNessesaryProductCourseFilter(filter);
            


            var criteria = new SortCriterion();
            var  result = questionCommands.GetQuestionList(productCourseId, productCourseId, filter, criteria, 0, 10);
            Assert.IsTrue(result.TotalItems == 0);

        }

        [TestMethod]
        public void GetQuestionList_OneUserFilter_ListOfTwoFilteredQuestions()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetTwoAgilixQuestions));

            var filter = new List<FilterFieldDescriptor>
                         {
                             new FilterFieldDescriptor()
                             {
                                 Field = MetadataFieldNames.Bank,
                                 Values = new List<string>(){"Bank 1"}
                             }
                         };

           
            AddNessesaryProductCourseFilter(filter);


            var criteria = new SortCriterion();
            var result = questionCommands.GetQuestionList(productCourseId, productCourseId, filter, criteria, 0, 10);
            Assert.IsTrue(result.TotalItems == 2);
            Assert.IsTrue(result.CollectionPage.ToList().Select(x => x.Id).Contains("4684f693-7997-4dc2-8496-56eb645e47ac"));
        }


        [TestMethod]
        public void GetQuestionList_NoSortingParameters_SeqSortingByDefault()
        {
            const string expectedFieldsParameters = "draftfrom|product-course-id-12/bank";
            bool searchCommandCorrectlyBuildSortingCriteria = false;

            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetTwoAgilixQuestions));
            
            context.SessionManager.CurrentSession.When(x=>x.ExecuteAsAdmin(
                                                      Arg.Is<Search>(a=>a.SearchParameters.Fields==expectedFieldsParameters)
                                                      )).Do(x => searchCommandCorrectlyBuildSortingCriteria=true);

            var filter = new List<FilterFieldDescriptor>();
            AddNessesaryProductCourseFilter(filter);
            var criteria = new SortCriterion();

            questionCommands.GetQuestionList(productCourseId, productCourseId, filter, criteria, 0, 10);

            Assert.IsTrue(searchCommandCorrectlyBuildSortingCriteria);
        }

        [TestMethod]
        public void GetQuestionList_SortingCustomFieldDesc_ApplySortingForSearchCommand()
        {
            const string expectedFieldsParameters = "draftfrom|product-course-id-12/CustomField";
            bool searchCommandCorrectlyBuildSortingCriteria = false;

            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetTwoAgilixQuestions));

            context.SessionManager.CurrentSession.When(x => x.ExecuteAsAdmin(
                                                      Arg.Is<Search>(a => a.SearchParameters.Fields == expectedFieldsParameters)
                                                      )).Do(x => searchCommandCorrectlyBuildSortingCriteria = true);

            var filter = new List<FilterFieldDescriptor>();
            AddNessesaryProductCourseFilter(filter);
            var criteria = new SortCriterion()
                           {
                               SortType = SortType.Desc,
                               ColumnName = "CustomField"
                           };

            questionCommands.GetQuestionList(productCourseId, productCourseId, filter, criteria, 0, 10);

            Assert.IsTrue(searchCommandCorrectlyBuildSortingCriteria);
        }

        [TestMethod]
        public void GetQuestionList_OneQuestionPerPageAndPageNo2_ReturnSecondQuestion()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetAgilixQuestion));

            var filter = new List<FilterFieldDescriptor>();
            AddNessesaryProductCourseFilter(filter);
            var criteria = new SortCriterion();

            var result = questionCommands.GetQuestionList(productCourseId, productCourseId, filter, criteria, 1, 1);

            Assert.IsTrue(result.TotalItems==2);
            Assert.IsTrue(result.CollectionPage.Count() == 1);
            Assert.IsTrue(result.CollectionPage.FirstOrDefault().Id == "4684f693-7997-4dc2-8496-56eb645e47ac");
        }

        [TestMethod]
        public void GetQuestionList_OneQuestionPerPageAndPageNo1_ReturnFirstQuestion()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetAgilixQuestion));

            var filter = new List<FilterFieldDescriptor>();
            AddNessesaryProductCourseFilter(filter);
            var criteria = new SortCriterion();

            var result = questionCommands.GetQuestionList(productCourseId, productCourseId, filter, criteria, 0, 1);

            Assert.IsTrue(result.TotalItems == 2);
            Assert.IsTrue(result.CollectionPage.Count() == 1);
            Assert.IsTrue(result.CollectionPage.FirstOrDefault().Id == "f13f2cd1-2ddf-430c-85c9-2577a5f009f4");
        }


        [TestMethod]
        public void GetComparedQuestionList_OneQuestionPerPageAndPageNo1_ReturnFirstQuestion()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetAgilixQuestion));

           
            var result = questionCommands.GetComparedQuestionList("131", "431", "3541", 0, 1);

            Assert.IsTrue(result.TotalItems == 2);
            Assert.IsTrue(result.CollectionPage.Count() == 1);
        }


        //Use VPN to get Faceted xml for tests
        [TestMethod]
        public void GetFacetedResults_OneQuestionPerPageAndPageNo1_ReturnFirstQuestion()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));

            var result = questionCommands.GetFacetedResults("210017", "12", "chapter");

         
        }

        [TestMethod]
        public void CreateQuestions_TwoQuestionsToCreateWithoutBank_ProperplySettedQuestionsFieldsWithInitialSequence()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillNoQuestions));
            var course = GetTestCourse();
            var questions = new List<Models.Question>
                           {
                               new Models.Question()
                               {
                                   Id = "1",
                                   Version = 3,
                                   ProductCourseSections = new List<QuestionMetadataSection>()
                                                           {
                                                               new QuestionMetadataSection()
                                                               {
                                                                   ProductCourseId = course.ProductCourseId
                                                               }
                                                           },
                                   InteractionType = "2"

                               },
                               new Models.Question()
                               {
                                   Id = "1",
                                   ProductCourseSections = new List<QuestionMetadataSection>()
                                                           {
                                                               new QuestionMetadataSection()
                                                               {
                                                                   ProductCourseId = course.ProductCourseId
                                                               }
                                                           },
                                  InteractionType = "2"
                               }
                           };

           questionCommands.CreateQuestions(course.ProductCourseId, questions);

            foreach (var question in questions)
            {
                Assert.IsTrue(question.Id != "1");
                Assert.IsTrue(question.ModifiedBy == context.CurrentUser.Id);
                Assert.IsTrue(question.ProductCourseSections.First().Sequence == "1");
            }


          

        }

        [TestMethod]
        public void CreateQuestions_TwoQuestionsToCreate_ProperplySettedQuestionsSeq()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));
            var course = GetTestCourse();
            var questions = new List<Models.Question>
                           {
                               new Models.Question()
                               {
                                   Id = "1",
                                   Version = 3,
                                   ProductCourseSections = new List<QuestionMetadataSection>()
                                                           {
                                                               new QuestionMetadataSection()
                                                               {
                                                                   ProductCourseId = course.ProductCourseId,
                                                                   Bank = "Test Bank"
                                                               }
                                                           },
                                   InteractionType = "2"

                               },
                               new Models.Question()
                               {
                                   Id = "1",
                                   ProductCourseSections = new List<QuestionMetadataSection>()
                                                           {
                                                               new QuestionMetadataSection()
                                                               {
                                                                   ProductCourseId = course.ProductCourseId,
                                                                   Bank = "Test Bank"
                                                               }
                                                           },
                                  InteractionType = "2"
                               }
                           };

            questionCommands.CreateQuestions(course.ProductCourseId, questions);

            foreach (var question in questions)
            {
                Assert.IsTrue(question.Id != "1");
                Assert.IsTrue(question.ModifiedBy == context.CurrentUser.Id);
                Assert.IsTrue(question.ProductCourseSections.First().Sequence == "19");
            }

        }

        [TestMethod]
        public void CreateQuestion_QuestionToCreate_ProperplySettedQuestionsSeq()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));
            var course = GetTestCourse();
            var question = new Models.Question()
                            {
                                Id = "1",
                                Version = 3,
                                ProductCourseSections = new List<QuestionMetadataSection>()
                                                        {
                                                            new QuestionMetadataSection()
                                                            {
                                                                ProductCourseId = course.ProductCourseId,
                                                                Bank = "Test Bank"
                                                            }
                                                        },
                                InteractionType = "2"

                            };
                             

            questionCommands.CreateQuestion(course.ProductCourseId, question);
            Assert.IsTrue(question.Id != "1");
            Assert.IsTrue(question.ModifiedBy == context.CurrentUser.Id);
            Assert.IsTrue(question.ProductCourseSections.First().Sequence == "19");
           

        }

        [TestMethod]
        public void ExecuteSolrUpdateTask_NoParametrs_SuccesRun()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetTaskList>(ExecuteAsAdminReturnTaskList));
            questionCommands.ExecuteSolrUpdateTask();
        }


         [TestMethod]
        public void ExecutePutQuestion_AgilixQuestionsWithVersion_ProperlySettedDuplicateFromShared()
         {
             var question = new Question()
                            {
                                QuestionVersion = "14",
                                MetadataElements = new Dictionary<string, XElement>
                                                   {
                                                       {MetadataFieldNames.DuplicateFromShared, new XElement("test")}
                                                   },
                                InteractionType = "2"
                            };
             
             context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetTaskList>(ExecuteAsAdminReturnTaskList));
             questionCommands.ExecutePutQuestion(question);
             Assert.IsTrue(question.MetadataElements[MetadataFieldNames.DuplicateFromShared].Name != "test");
        }


         [TestMethod]
         [ExpectedException(typeof(ArgumentNullException))]
         public void ExecutePutQuestion_InvalidQuestion_FailedOnInvalidateCache()
         {
             var question = new Question()
             {
                 QuestionVersion = "14",
                 MetadataElements = new Dictionary<string, XElement>
                                                   {
                                                       {MetadataFieldNames.DuplicateFromShared, new XElement("test")}
                                                   }
             };

             context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetTaskList>(ExecuteAsAdminReturnTaskList));
             questionCommands.ExecutePutQuestion(question);
         }

         [TestMethod]
         public void DeleteItem_Params_SuccessRun()
         {
             questionCommands.DeleteItem("2423", " 4353");
         }

         [TestMethod]
         [ExpectedException(typeof(ArgumentNullException))]
         public void DeleteQuestion_Nulls_FailedRun()
         {
             questionCommands.DeleteQuestion(null, null);
         }


         [TestMethod]
         [ExpectedException(typeof(ArgumentNullException))]
         public void DeleteQuestion_NotExistingQuestion_FailedRunOnInvalidateCache()
         {
             questionCommands.DeleteQuestion("2423", "4353");
         }


         [TestMethod]
         public void DeleteQuestion_CorrectParams_SuccessRun()
         {
             context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetAgilixQuestion));
             questionCommands.DeleteQuestion("2423", "4353");
         }

        [TestMethod]
        public void GetQuestionDrafts_AnyQuestion_QuestionDrafts()
        {
            var course = GetTestCourse();
            var question = new Models.Question
                           {
                               Id = "f13f2cd1-2ddf-430c-85c9-2577a5f009f4"
                           };
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(command =>
                                                                                      {
                                                                                          Assert.IsTrue(command.SearchParameters.QuestionIds.Contains("4684f693-7997-4dc2-8496-56eb645e47ac"));
                                                                                          ExecuteAsAdminGetTwoAgilixQuestions(command);
                                                                                      }));
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(search =>
                                                                                {
                                                                                    Assert.IsTrue(search.SearchParameters.Query == string.Format("(dlap_class:question) AND (draftfrom:{0})", question.Id));
                                                                                    Assert.IsTrue(search.SearchParameters.EntityId == course.QuestionRepositoryCourseId);
                                                                                    ExecuteAsAdminFillTwoQuestions(search);
                                                                                }));
            var drafts = questionCommands.GetQuestionDrafts(course.QuestionRepositoryCourseId, question);
            Assert.IsTrue(drafts.Count() == 2);
            Assert.IsTrue(drafts.Select(d => d.Id).Contains("4684f693-7997-4dc2-8496-56eb645e47ac"));
        }


        [TestMethod]
        public void GetVersionHistory_AnyQuestion_QuestionHistoryWithCorrectPreviewLinks()
        {
            
            
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetTwoAgilixQuestions));
            var course = GetTestCourse();
            var versions = questionCommands.GetVersionHistory(course.QuestionRepositoryCourseId, "21");
            Assert.IsTrue(versions.Count() == 2);
            Assert.IsTrue(versions.Select(x => x.Preview).Any(x => x.Contains(String.Format(@"src=""/brainhoney/Resource/{0}/[~]/folder/image.jpg""", course.QuestionRepositoryCourseId))));

        }


        [TestMethod]
        public void RemoveFromTitle_AnyQuetionIds_True()
        {

            var agilixQuestions = new List<Question>()
                                       {
                                           new Question()
                                           {
                                               Id = "f13f2cd1-2ddf-430c-85c9-2577a5f009f4",
                                               MetadataElements = new Dictionary<string, XElement>
                                                                  {
                                                                      {"product-course-id-1234", XElement.Parse(productCourseSection)},
                                                                      {"product-course-id-122434", XElement.Parse(productCourseSection)}
                                                                  },
                                                InteractionType = "2"
                                               

                                           }
                                       };

            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(questions => questions.Questions = agilixQuestions));
            var course = GetTestCourse();


            Assert.IsTrue(questionCommands.RemoveFromTitle(new[] { "3232", "223" }, course.QuestionRepositoryCourseId, "1234"));
            Assert.IsTrue(agilixQuestions.First().MetadataElements.Count == 1);

        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        public void RemoveFromTitle_Null_False()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetTwoAgilixQuestions));
            Assert.IsFalse(questionCommands.RemoveFromTitle(null, null, null));

        }


        [TestMethod]
        public void SetSequence_Question_ProperplySettedQuestionSeq()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<Search>(ExecuteAsAdminFillTwoQuestions));
            var course = GetTestCourse();
            var question = new Models.Question()
            {
                Id = "1",
                Version = 3,
                ProductCourseSections = new List<QuestionMetadataSection>()
                                                        {
                                                            new QuestionMetadataSection()
                                                            {
                                                                ProductCourseId = course.ProductCourseId,
                                                                Bank = "Test Bank",
                                                                Sequence = "0"
                                                            }
                                                        },
                InteractionType = "2"

            };


            questionCommands.SetSequence(course.ProductCourseId, question);
            Assert.IsTrue(question.ProductCourseSections.First().Sequence == "19");
   
        }

        [TestMethod]
        public void UpdateQuestion_QuestionToSave_QuestionWithModifBySetted()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetTwoAgilixQuestions));
            var course = GetTestCourse();
            var question = new Models.Question()
            {
                Id = "1",
                ProductCourseSections = new List<QuestionMetadataSection>()
                                                        {
                                                            new QuestionMetadataSection()
                                                            {
                                                                ProductCourseId = course.ProductCourseId
                                                            }
                                                        },
                InteractionType = "2"

            };

           var result = questionCommands.UpdateQuestion(question);
           Assert.IsTrue(result.Id == question.Id);
           Assert.IsTrue(result.ModifiedBy == context.CurrentUser.Id);

        }


        [TestMethod]
        public void UpdateQuestions_QuestionsToSave_UpdatedQuestions()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetTwoAgilixQuestions));
            var course = GetTestCourse();
            var questions = new List<Models.Question>
                           {
                               new Models.Question()
                               {
                                   Id = "1",
                                   InteractionType = "2"

                               },
                               new Models.Question()
                               {
                                   Id = "1",
                                  InteractionType = "2"
                               }
                           };

            Assert.IsTrue(questionCommands.UpdateQuestions(questions, course.QuestionRepositoryCourseId, course.ProductCourseId));

            foreach (var question in questions)
            {
                Assert.IsTrue(question.Id == "1");
            }

        }


        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        public void UpdateQuestions_Null_False()
        {
           Assert.IsFalse(questionCommands.UpdateQuestions(null,null)); 
           
        }

        [TestMethod]
        public void GetAgilixQuestion_QuestionId_Question()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetAgilixQuestion));
            var course = GetTestCourse();
            var question = questionCommands.GetAgilixQuestion(course.QuestionRepositoryCourseId, "df");
            Assert.IsTrue(question.Id == "df");
            Assert.IsTrue(question.InteractionType == "2");
        }

        [TestMethod]
        public void GetAgilixQuestion_QuestionIdAndVersion_SpecificVersion()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetTwoAgilixQuestions));
            var course = GetTestCourse();
            var question = questionCommands.GetAgilixQuestion(course.QuestionRepositoryCourseId, "df", "3");
            Assert.IsTrue(question.QuestionVersion == "3");
        }



        [TestMethod]
        public void GetQuestion_QuestionId_Question()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetAgilixQuestion));
            var question = questionCommands.GetQuestion(GetTestCourse().QuestionRepositoryCourseId, "df");
            Assert.IsTrue(question.Id == "df");

        }

        [TestMethod]
        public void GetQuestions_QuestionIds_Questions()
        {
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetQuestions>(ExecuteAsAdminGetAgilixQuestion));
            var course = GetTestCourse();
            var questions = questionCommands.GetQuestions(course.QuestionRepositoryCourseId, new []{"12", "35"});
            Assert.IsTrue(questions.Any(x=> x.Id == "12"));
            Assert.IsTrue(questions.Any(x => x.Id == "35"));
        }


        [TestMethod]
        public void GetQuizIdForQuestion_QuestionIdWithQuizId_QuizId()
        {
            var quizId = "4331";
            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetItems>(items =>
                                                                                  {
                                                                                      Assert.IsTrue(items.SearchParameters.Query == "/Questions/question@id='123'");
                                                                                      items.Items =
                                                                                          new PagedList<Item>(
                                                                                              new List<Item>()
                                                                                              {
                                                                                                  new Item()
                                                                                                  {
                                                                                                      Id = quizId
                                                                                                  }
                                                                                              }, 0, 1);

                                                                                  }));
            Assert.IsTrue(quizId == questionCommands.GetQuizIdForQuestion("123", "345"));
        }

        [TestMethod]
        public void GetQuizIdForQuestion_QuestionIdWithoutQuizId_EmptyString()
        {

            context.SessionManager.CurrentSession.ExecuteAsAdmin(Arg.Do<GetItems>(items =>
                    {
                        Assert.IsTrue(items.SearchParameters.Query == "/Questions/question@id='123'");
                        items.Items = new PagedList<Item>(new List<Item>(), 0, 1);
                    }));
           Assert.IsTrue(string.IsNullOrEmpty(questionCommands.GetQuizIdForQuestion("123", "345")));
        }

      



        #region private methods

        private void ExecuteAsAdminReturnTaskList(GetTaskList taskCmd)
        {
            taskCmd.ParseResponse(new DlapResponse(XDocument.Parse(taskResponse)));
        }

        private void ExecuteAsAdminFillTwoQuestions(Search search)
        {
            search.SearchResults = XDocument.Parse(twoQuestionsSOLRSearchResultResponse);
        }

        private void ExecuteAsAdminFillNoQuestions(Search search)
        {
            search.SearchResults = new XDocument();

        }

        private void ExecuteAsAdminGetAgilixQuestion(GetQuestions questionSearch)
        {
            var questions = new List<Question>();
            foreach (var quesionId in questionSearch.SearchParameters.QuestionIds)
            {
                questions.Add(new Question()
                              {
                                  Id = quesionId,
                                  MetadataElements = new Dictionary<string, XElement> { { "product-course-id-12", XElement.Parse(productCourseSection) } },
                                  InteractionType = "2"
                              });
            }

            questionSearch.Questions = questions;
        }

        private void AddNessesaryProductCourseFilter(  List<FilterFieldDescriptor> filter)
        {
            filter.Add(new FilterFieldDescriptor()
            {
                Field = MetadataFieldNames.ProductCourse,
                Values = new List<string>() { productCourseId }
            });
            
        }

        private void ExecuteAsAdminGetTwoAgilixQuestions(GetQuestions questionSearch)
        {
            questionSearch.Questions = new List<Question>()
                                       {
                                           new Question()
                                           {
                                               Id = "f13f2cd1-2ddf-430c-85c9-2577a5f009f4",
                                               MetadataElements = new Dictionary<string, XElement>
                                                                  {
                                                                      {"product-course-id-12", XElement.Parse(productCourseSection)}
                                                                  },
                                               

                                           },
                                           new Question(){
                                               Id = "4684f693-7997-4dc2-8496-56eb645e47ac",
                                               MetadataElements = new Dictionary<string, XElement>{{"product-course-id-12", XElement.Parse(productCourseSection)}},
                                               InteractionType = "choice",
                                               Choices = new List<QuestionChoice>()
                                                         {
                                                             new QuestionChoice()
                                                             {
                                                                 Id = "1",
                                                                 Text = @"src=""[~]/folder/image.jpg"""
                                                             }
                                                         },
                                                QuestionVersion = "3"
                                           }
                                       };
        }

        private Course GetTestCourse()
        {
            return new Course()
            {
                QuestionRepositoryCourseId = "1525",
                ProductCourseId = "12",
                FieldDescriptors = new List<CourseMetadataFieldDescriptor>()
            };
        }

        #endregion
    }
}
