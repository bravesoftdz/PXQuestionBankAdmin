﻿using System.Collections.Generic;

namespace Macmillan.PXQBA.Business.Models.Web
{
    /// <summary>
    /// Represent collection of question for react.js controls
    /// </summary>
    public class QuestionListDataResponse
    {
        /// <summary>
        /// Current page number
        /// </summary>
        public int PageNumber { get; set; }

        /// <summary>
        /// List of questions
        /// </summary>
        public IEnumerable<QuestionMetadata> QuestionList { get; set; }

        /// <summary>
        /// Total pages for current query
        /// </summary>
        public int TotalPages { get; set; }

        /// <summary>
        /// Field Ordering
        /// </summary>
        public QuestionOrder Order { get; set; }

        public IEnumerable<QuestionFieldViewModel> Columns { get; set; }

        public IEnumerable<QuestionFieldViewModel> AllAvailableColumns { get; set; }
    }
}