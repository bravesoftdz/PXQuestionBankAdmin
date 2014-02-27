SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[SP_rptCommentsold]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[SP_rptCommentsold]
END
GO

CREATE PROCEDURE [dbo].[SP_rptCommentsold] 
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
			cs.Topic,
			cs.Wordcount ,
			en.StudentID,
			sm.StudentName
			FROM rpt_ContentSubmission cs 
			inner join rpt_Enrollment en ON
			cs.EnrollmentID = en.EnrollmentID 
			inner join rpt_StudentMaster sm ON
			en.StudentID = sm.StudentID and cs.EnrollmentID = en.EnrollmentID 
			Where 
				cs.ContentTypeID = 5 and (cs.ContentSubmissionDate >=@StartDate and cs.ContentSubmissionDate <=@EndDate) 
		END
	ELSE
		BEGIN 
			SELECT
			cs.ContentSubmissionDate,
			cs.Topic,
			cs.Wordcount ,
			en.StudentID,
			sm.StudentName
			FROM rpt_ContentSubmission cs 
			inner join rpt_Enrollment en ON
			cs.EnrollmentID = en.EnrollmentID 
			inner join rpt_StudentMaster sm ON
			en.StudentID = sm.StudentID and cs.EnrollmentID = en.EnrollmentID 
			Where 
				en.StudentID = isnull(@StudentID,en.StudentID) and cs.ContentTypeID = 5 and (cs.ContentSubmissionDate >=@StartDate and cs.ContentSubmissionDate <=@EndDate) 
		END
END

GO