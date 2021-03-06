SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[SP_rptLogins]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[SP_rptLogins]
END
GO

CREATE PROCEDURE [dbo].[SP_rptLogins] 
	-- Add the parameters for the stored procedure here
(
	@StudentID int = 0,
	@StartDate datetime =null,
	@EndDate datetime = null
)	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	IF @StudentID = 0 
		BEGIN
			select en.StudentID,sm.StudentName ,COUNT(cs.ContentSubmissionDate) as NoofLogins, MAX(cts.SessionStartDate )as LastLoginDate, str(sum(datediff(MI,cts.SessionStartDate,cts.SessionEndDate))/60,2,0) + ' h ' + replace(str(SUM(DATEDIFF(MI,cts.SessionStartDate,cts.SessionEndDate))%60,2,0),' ','0') + ' min' 
			as SessionLength
			FROM rpt_ContentSubmission cs left join 
			rpt_ContentSession cts on cs.ContentSubmissionID = cts.ContentSubmissionID inner join
			rpt_Enrollment en on cs.EnrollmentID = en.EnrollmentID inner join
			rpt_StudentMaster sm on en.StudentID = sm.StudentID 
			WHERE (cs.ContentSubmissionDate >=@StartDate and cs.ContentSubmissionDate <=@EndDate)
			GROUP BY en.StudentID ,sm.StudentName 
		END
	ELSE
		BEGIN
			select en.StudentID,sm.StudentName ,COUNT(cs.ContentSubmissionDate) as NoofLogins, MAX(cts.SessionStartDate )as LastLoginDate, str(sum(datediff(MI,cts.SessionStartDate,cts.SessionEndDate))/60,2,0) + ' h ' + replace(str(SUM(DATEDIFF(MI,cts.SessionStartDate,cts.SessionEndDate))%60,2,0),' ','0') + ' min' 
			as SessionLength
			FROM rpt_ContentSubmission cs left join 
			rpt_ContentSession cts on cs.ContentSubmissionID = cts.ContentSubmissionID inner join
			rpt_Enrollment en on cs.EnrollmentID = en.EnrollmentID inner join
			rpt_StudentMaster sm on en.StudentID = sm.StudentID 
			WHERE en.StudentID =isnull(@StudentID,en.StudentID ) and (cs.ContentSubmissionDate >=@StartDate and cs.ContentSubmissionDate <=@EndDate)
			GROUP BY en.StudentID ,sm.StudentName 
		END	
END

GO