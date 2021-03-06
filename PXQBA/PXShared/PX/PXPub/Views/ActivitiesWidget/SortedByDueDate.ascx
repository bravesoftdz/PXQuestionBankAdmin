﻿<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Bfw.PX.PXPub.Models.ActivitiesWidget>" %>

<%  string oldTitle = "";
    bool previousAssignment = false;
    bool useEasyXdm = ViewData["UseEasyXdm"] == null ? false : (bool)ViewData["UseEasyXdm"];
    
    string remoteUrl = "";
    foreach (KeyValuePair<string, List<Activity>> i in Model.GroupedActivities)
    {
        foreach (Activity a in i.Value)
        {
            string assignedTextChange = a.isAssigned && !a.IsUserSubmitted ? "assignedTextChange" : "";
            string studentViewFlag = "&view=student";
            string reportFlag = "&show_report=true&report_type=showAll";
            string reportingMode = "&reportingMode=arga";
            string debugMode = "&test_mode=true";
            string q = string.Empty;


            if (string.IsNullOrEmpty(remoteUrl))
            {
                try
                {
                    remoteUrl = a.Href.Split('?')[0];
                }
                catch
                {
                    remoteUrl = a.Href;
                }
            }
            if (a.Href != null && !a.Href.Contains("approot"))
            {
                var appRoot = System.Configuration.ConfigurationManager.AppSettings["scorm_approot"];

                if (string.IsNullOrEmpty(appRoot))
                {
                    appRoot = "/brainhoney";
                }
                else
                {
                    appRoot = appRoot.Replace("[domain]", Model.Userspace);

                    string documentDomain = string.Empty;
                    Uri requestUrl = System.Web.HttpContext.Current.Request.Url;
                    string host = requestUrl.Host;
                    if (!host.Contains("."))
                    {
                        documentDomain = host; // this will handle the case for "localhost"
                    }
                    else
                    {
                        string[] splitParts = host.Split('.');
                        int length = splitParts.Length;
                        documentDomain = string.Format("{0}.{1}", splitParts[length - 2], splitParts[length - 1]);
                    }
                    appRoot = appRoot.Replace("[company]", documentDomain);
                    if (appRoot.Contains("localhost"))
                    {
                        appRoot = appRoot.Replace("localhost", "bedfordstmartins.com");
                    }
                }
                if (!a.Href.IsNullOrEmpty())
                {
                    q = string.Format("{3}enrollmentid={0}&itemid={1}&approot={2}", Model.EnrollmentId, a.Id, appRoot, a.Href.Contains("?") ? "&" : "?");

                }
            }
            a.Href = a.Href + reportingMode + (ResourceEngine.IsDebug() ? debugMode : "") + q + "&lc_type=standalone";
            
            if (a.UserAccess != Bfw.PX.Biz.ServiceContracts.AccessLevel.Instructor)
            {
                a.Href = a.Href + studentViewFlag;

            }
            var reportLink = a.Href + reportFlag;
%>
    <% if (oldTitle != a.MetaTopic || a.isAssigned != previousAssignment)
       { %>
        <tr>
            <td colspan="3" class="topicRow">
                <%= a.MetaTopic %>
            </td>
        </tr>
    <% oldTitle = a.MetaTopic;
       previousAssignment = a.isAssigned;

       } %>
    <tr class="itemRow " data-aw-id="<%= a.Id %>">
        <td class="colIndex1">
            <span url="<%= a.Href %> " class="activityNameLink <%= a.isAssigned && !a.IsUserSubmitted? "" : "noDecoration" %> titleSpan">
                <%= a.Title %></span>
        </td>
        <% Html.RenderPartial("DueDateColumn", a); %>
        <td class="links colIndex3">
            <span url="<%= reportLink %>" class="reportLink <%= assignedTextChange %> reportSpan">
                Report</span>
        </td>
    </tr>

<%
        }
    }


  if(useEasyXdm)
{%>

<script type="text/javascript">
    (function ($) {
        var deps = [
                        '<%= Url.Content("~/Scripts/easyXDM/easyXDM.js") %>',
                        '<%= Url.Content("~/Scripts/LearningCurve/LearningCurve.js") %>'
        ];

        PxPage.OnReady(function () {
            PxPage.Require(deps, function () {

                LearningCurve.initalizeEasyXdm('<%=remoteUrl %>');
            });
        });

    }(jQuery));
</script>
<%} else
{
%>
<script type="text/javascript">
    (function ($) {
        var deps = [
                        '<%= Url.Content("~/Scripts/LearningCurve/LearningCurve.js") %>'
        ];

        PxPage.OnReady(function () {PxPage.Require(deps, function () {}); });

    }(jQuery));
</script>
<%
}
%>