﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Bfw.Agilix.Commands;
using Bfw.Agilix.DataContracts;
using Bfw.Common.Collections;
using Bfw.Common.Database;
using Macmillan.PXQBA.Business.Commands.Contracts;
using Macmillan.PXQBA.Common.Helpers;
using Macmillan.PXQBA.Common.Helpers.Constants;
using Course = Macmillan.PXQBA.Business.Models.Course;
using LearningObjective = Macmillan.PXQBA.Business.Models.LearningObjective;

namespace Macmillan.PXQBA.Business.Commands.Services.EntityFramework
{
    public class ProductCourseOperation : IProductCourseOperation
    {
        private readonly IDatabaseManager databaseManager;
        private readonly IContext businessContext;

        private const string DbColumnProductCourseId = "CourseId";

        public ProductCourseOperation(IDatabaseManager databaseManager, IContext businessContext)
        {
            this.databaseManager = databaseManager;
            this.businessContext = businessContext;
        }


        public IEnumerable<Course> GetAvailableCourses()
        {
            var query = String.Format(@"
                    DECLARE @webRight int
                    SET @webRight = (SELECT TOP 1 PxWebRightId FROM PxWebRights WHERE PxWebRightType = 'QuestionBank')
                    DECLARE @userId int
                    SELECT DISTINCT
                        CourseId
                    FROM
                        PxWebUserRights
                    WHERE
                        PxWebRightId = @webRight
                        AND UserId = '{0}'", businessContext.CurrentUser.Username);
            var dbRecords = databaseManager.Query(query);

            var courseIds = dbRecords.Select(record => record.String(DbColumnProductCourseId)).ToList();
            return GetCoursesByCourseIds(courseIds);
        }

        private IEnumerable<Course> GetCoursesByCourseIds(IEnumerable<string> courseIds)
        {
            var courses = new List<Course>();
            var batch = new Batch { RunAsync = true };

            foreach (var courseId in courseIds)
            {
                batch.Add(new GetCourse()
                {
                    SearchParameters = new CourseSearch()
                    {
                        CourseId = courseId
                    }
                });
            }

            businessContext.SessionManager.CurrentSession.ExecuteAsAdmin(batch);
            for (int index = 0; index < batch.Commands.Count(); index++)
            {
                if (batch.CommandAs<GetCourse>(index).Courses.IsNullOrEmpty())
                {
                    continue;
                }
                courses.Add(Mapper.Map<Course>(batch.CommandAs<GetCourse>(index).Courses.First()));
            }
            return courses;
        }

        public Course GetProductCourse(string productCourseId)
        {
            return new Course
            {
                ProductCourseId = productCourseId,
                Title = "Sample title",
                LearningObjectives = new List<LearningObjective>
                {
                    
                    new LearningObjective
                    {
                        Description = "Rhetorical Knowledge",
                        Guid = "9222c505-86f8-4a7c-9b6c-346e601d66b6"
                    },
                    new LearningObjective
                    {
                        Description = "Focus on a purpose",
                        Guid = "e8844d58-5c81-4eaa-897d-adcef44a68c1"
                    },
                    new LearningObjective
                    {
                        Description = "Respond to the needs of different audiences",
                        Guid = "87024fc0-36e3-4468-8162-f81f1590d55e"
                    },
                    new LearningObjective
                    {
                        Description = "Respond appropriately to different kinds of rhetorical situations and added more text to show how long text is wrapped in learning objective field on metadata tab of question editor",
                        Guid = "6344b2e5-1e8d-4585-a50f-22b442692c30"
                    },
                    new LearningObjective
                    {
                        Description = "Use conventions of format and structure appropriate to the rhetorical situation",
                        Guid = "7a5c30a8-78a1-4ddf-9e1d-c2ee6753aac9"
                    }
                },

                QuestionCardLayout = @"     <div class=""card"">
                                            <div class=""questioncardrow firstrow"">
                                            {{#if difficulty}}
                                            <div class=""difficulty"">
                                            <h1>Difficulty:</h1>
                                            <div class=""content"">{{difficulty}}</div>
                                            </div>
                                            {{/if}} {{#if cognitivelevel}}
                                            <div class=""cognitivelevel"">
                                            <h1>Cognitive level:</h1>
                                            <div class=""content"">{{cognitivelevel}}</div>
                                            </div>
                                             {{/if}} {{#if bank}}
                                            <div class=""bank"">
                                            <h1>Bank:</h1>
                                            <div class=""content"">{{bank}}</div>
                                            </div>
                                             {{/if}} {{#if chapter}}
                                            <div class=""chapter"">
                                            <h1>Chapter:</h1>
                                            <div class=""content"">{{chapter}}</div>
                                            </div>
                                            {{/if}} {{#if bloomdomain}}
                                            <div class=""bloomdomain"">
                                            <h1>Bloom's domain:</h1>
                                            <div class=""content"">{{bloomdomain}}</div>
                                            </div>
                                            {{/if}}
                                            </div>
                                            <div class=""questioncardrow"">
                                            {{#if coreconcept}}
                                            <div class=""coreconcept"">
                                            <h1>Core Concept:</h1>
                                            <div class=""content"">{{coreconcept}}</div>
                                            </div>
                                            {{/if}} {{#if relatedcontent}}
                                            <div class=""relatedcontent"">
                                            <h1>Related Content:</h1>
                                            <div class=""content"">{{relatedcontent}}</div>
                                            </div>
                                            {{/if}}
                                            </div>
                                            
                                            <div class=""questioncardrow"">
                                            {{#if freeresponsequestion}}
                                            <div class=""freeresponsequestion"">
                                            <h1>Free response question:</h1>
                                            <div class=""content"">{{freeresponsequestion}}</div>
                                            </div>
                                            {{/if}}
                                            </div>
                                            <div class=""questioncardrow"">
                                            {{#if suggesteduse}}
                                            <div class=""suggesteduse"">
                                            <h1>Suggested use:</h1>
                                            <div class=""content"">{{suggesteduse}}</div>
                                            </div>
                                            {{/if}}
                                            </div>
                                            <div class=""questioncardrow"">
                                            {{#if guidance}}
                                            <div class=""guidance"">
                                            <h1>Guidance:</h1>
                                            <div class=""content"">{{guidance}}</div>
                                            </div>
                                            {{/if}}
                                            </div>
                                            </div>
                                           "
            };
        }
    }
}
