SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[SP_rptQuizSubmission]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[SP_rptQuizSubmission]
END
GO

CREATE PROCEDURE [dbo].[SP_rptQuizSubmission] 
(
	-- Add the parameters for the stored procedure here
	@StudentID int = 0,
	@StartDate date =Null,
	@EndDate date =Null
	)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
    IF @StudentID = 0
		BEGIN 
			SELECT
			cs.ContentSubmissionDate,
			cs.EnrollmentID,
			cs.Topic,
			cs.Score,
			cs.IPAddress,
			(SELECT count(contentsubmissionid) FROM rpt_ContentSession cts WHERE cts.ContentSubmissionID = cs.ContentSubmissionID and cts.StatusID=1 ) AS TotalSubmissions,
			cs.EnrollmentID as StudentID,
			sm.StudentName,
			'Detail' as Detail  
			FROM rpt_ContentSubmission cs 
			inner join rpt_StudentMaster sm ON
			cs.EnrollmentID = sm.StudentID 
			Where 
				cs.ContentTypeID =1 and (cs.ContentSubmissionDate >=@StartDate and cs.ContentSubmissionDate <=@EndDate) 
		END
	ELSE
		BEGIN 
			SELECT
			cs.ContentSubmissionDate,
			cs.EnrollmentID,
			cs.Topic,
			cs.Score,
			cs.IPAddress,
			(SELECT count(contentsubmissionid) FROM rpt_ContentSession cts WHERE cts.ContentSubmissionID = cs.ContentSubmissionID and cts.StatusID=1 ) AS TotalSubmissions,
			cs.EnrollmentID as StudentID,
			sm.StudentName,
			'Detail' as Detail  
			FROM rpt_ContentSubmission cs 
			inner join rpt_StudentMaster sm ON
			cs.EnrollmentID = sm.StudentID  
			Where 
				cs.EnrollmentID = isnull(@StudentID,cs.EnrollmentID ) and cs.ContentTypeID =1 and (cs.ContentSubmissionDate >=@StartDate and cs.ContentSubmissionDate <=@EndDate) 
		END
END

GO