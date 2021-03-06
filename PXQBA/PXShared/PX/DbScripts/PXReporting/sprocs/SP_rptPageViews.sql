SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[SP_rptPageViews]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[SP_rptPageViews]
END
GO

CREATE PROCEDURE [dbo].[SP_rptPageViews]
	-- Add the parameters for the stored procedure here
		@StudentID int = 0,
		@StateDate datetime =null,
		@EndDate datetime =null
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
    IF @StudentID = 0 
		BEGIN
			SELECT cs.ContentSubmissionDate,sm.StudentName,en.StudentID , cs.Topic,  
			Str(DateDiff(MI, cts.SessionStartDate,cts.SessionEndDate)/60,2,0) + '  h  ' + Replace(Str(DateDiff(MI, cts.SessionStartDate, cts.SessionEndDate)%60,2,0), ' ', '0')+ '  min' AS SessionLength
			FROM rpt_ContentSubmission cs inner join
				 rpt_Enrollment en ON cs.EnrollmentID = en.EnrollmentID Inner Join
				 rpt_StudentMaster sm ON en.StudentID = sm.StudentID Inner Join
				 rpt_ContentSession cts ON cs.ContentSubmissionID = cts.ContentSubmissionID 
			WHERE cs.ContentTypeID =8 and (cs.ContentSubmissionDate >=@StateDate and cs.ContentSubmissionDate <= @EndDate )	 
		END
	ELSE
		BEGIN
			SELECT cs.ContentSubmissionDate,sm.StudentName,en.StudentID , cs.Topic,  
			Str(DateDiff(MI, cts.SessionStartDate,cts.SessionEndDate)/60,2,0) + '  h  ' + Replace(Str(DateDiff(MI, cts.SessionStartDate, cts.SessionEndDate)%60,2,0), ' ', '0')+ '  min' AS SessionLength
			FROM rpt_ContentSubmission cs inner join
				 rpt_Enrollment en ON cs.EnrollmentID = en.EnrollmentID Inner Join
				 rpt_StudentMaster sm ON en.StudentID = sm.StudentID Inner Join
				 rpt_ContentSession cts ON cs.ContentSubmissionID = cts.ContentSubmissionID 
			WHERE sm.StudentID =isnull(@StudentID,en.StudentID) and cs.ContentTypeID =8 and (cs.ContentSubmissionDate >=@StateDate and cs.ContentSubmissionDate <= @EndDate )	 
		END
END

GO		
