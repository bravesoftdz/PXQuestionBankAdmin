﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Bfw.Agilix.Dlap;
using Bfw.Agilix.Dlap.Session;
using Bfw.Agilix.DataContracts;
using Bfw.Common.Collections;

namespace Bfw.Agilix.Commands
{
    public class DeleteEnrollments : DlapCommand
    {
        #region Properties

        /// <summary>
        /// Gets or sets the enrollments to delete.
        /// </summary>
        /// <value>The enrollments.</value>
        /// <remarks></remarks>
        public IList<Enrollment> Enrollments { get; set; }

        #endregion

        #region override DlapCommand

        /// <summary>
        /// Builds request required by the http://dev.dlap.bfwpub.com/Docs/Command/DeleteEnrollments command.
        /// </summary>
        /// <returns>Request conforming to http://dev.dlap.bfwpub.com/Docs/Command/DeleteEnrollments</returns>
        /// <remarks></remarks>
        public override DlapRequest ToRequest()
        {
            var request = new DlapRequest()
            {
                Type = DlapRequestType.Post,
                Mode = DlapRequestMode.Batch,
                Parameters = new Dictionary<string, object>() {
                    { "cmd", "deleteenrollments" }
                }
            };

            if (!Enrollments.IsNullOrEmpty())
            {
                foreach (var enrollment in Enrollments)
                {
                    request.AppendData(enrollment.ToEntity());
                }
            }

            return request;
        }

        /// <summary>
        /// Parses the response of the http://dev.dlap.bfwpub.com/Docs/Command/DeleteEnrollments command.
        /// </summary>
        /// <param name="response"><see cref="DlapResponse"/> to parse</param>
        /// <remarks></remarks>
        public override void ParseResponse(DlapResponse response)
        {
            if (response.Code != DlapResponseCode.OK)
            {
                throw new DlapException(string.Format("DeleteEnrollments command failed with code {0}", response.Code));
            }

            if (response.IsBatch && !response.Batch.IsNullOrEmpty())
            {
                foreach (var resp in response.Batch)
                {
                    if (response.Code != DlapResponseCode.OK)
                        throw new DlapException(string.Format("DeleteEnrollments command failed with code {0}", response.Code));
                }
            }
        }

        #endregion
    }
}
