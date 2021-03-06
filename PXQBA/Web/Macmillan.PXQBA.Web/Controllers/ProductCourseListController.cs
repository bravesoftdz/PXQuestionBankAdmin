﻿using System.Linq;
using AutoMapper;
using System.Collections.Generic;
using System.Web.Mvc;
using Macmillan.PXQBA.Business.Contracts;
using Macmillan.PXQBA.Business.Models;
using Macmillan.PXQBA.Common.Helpers;
using Macmillan.PXQBA.Web.ViewModels.TiteList;

namespace Macmillan.PXQBA.Web.Controllers
{
    public class ProductCourseListController : MasterController
    {
        private readonly IProductCourseManagementService productCourseManagementService;
        private readonly IUserManagementService userManagementService;
        private readonly string baseLaunchpadUrl;

        public ProductCourseListController(IProductCourseManagementService productCourseManagementService, IUserManagementService userManagementService)
        {
            this.productCourseManagementService = productCourseManagementService;
            this.userManagementService = userManagementService;
            this.baseLaunchpadUrl = ConfigurationHelper.GetBaseLaunchpadUrl();
        }

        public ActionResult Index()
        {
            return View(new ProductCourseListPageViewModel
                        {
                            SiteBuilderLink = baseLaunchpadUrl
                        });
        }


        [HttpPost]
        public ActionResult GetTitleData()
        {
            var titles = Mapper.Map<IEnumerable<ProductCourseViewModel>>(productCourseManagementService.GetCourseList());
            UpdateCapabilities(titles);
            return JsonCamel(new ProductCourseListDataResponse
                             {
                                 Titles = titles
                             });
        }

        public ActionResult AddNewRepository(string name)
        {
            productCourseManagementService.CreateNewDraftCourse(name);
            return JsonCamel(new {isError = false});
        }

        [HttpPost]
        public ActionResult AddSiteBuilderRepository(string url)
        {
            string courseId = productCourseManagementService.AddSiteBuilderCourse(url);

            return JsonCamel(new AddSiteBuilderRepositoryResponse
                             {
                                 IsError = string.IsNullOrEmpty(courseId),
                                 CourseId = courseId
                             });
        }

        private void UpdateCapabilities(IEnumerable<ProductCourseViewModel> titles)
        {
            foreach (var productCourseViewModel in titles)
            {
                var capabilities = userManagementService.GetUserCapabilities(productCourseViewModel.Id);
                productCourseViewModel.CanViewQuestionList = capabilities.Contains(Capability.ViewQuestionList);
            }
        }
    }
}