SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[SP_rptComments1]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[SP_rptComments1]
END
GO

CREATE PROCEDURE [dbo].[SP_rptComments1] 
(
	-- Add the parameters for the stored procedure here
	@StudentID int = 0,
	@GroupID int = 0,
	@StartDate date =Null,
	@EndDate date =Null
	)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
    IF (@GroupID = 0 AND @StudentID = 0) 
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
	IF (@GroupID = 0 AND @StudentID <> 0 )
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
				en.StudentID=@StudentID and cs.ContentTypeID = 5 and (cs.ContentSubmissionDate >=@StartDate and cs.ContentSubmissionDate <=@EndDate) 
		END
	IF (@GroupID <> 0 AND @StudentID = 0)
		BEGIN 
			SELECT
			cs.ContentSubmissionDate,
			cs.Topic,
			cs.Wordcount ,
			en.StudentID,
			sm.StudentName,
			gm.GroupID ,
			gm.GroupName 
			FROM rpt_ContentSubmission cs 
			inner join rpt_Enrollment en ON
			cs.EnrollmentID = en.EnrollmentID 
			inner join rpt_StudentMaster sm ON
			en.StudentID = sm.StudentID and cs.EnrollmentID = en.EnrollmentID 
			inner join rpt_GroupMaster gm ON en.StudentID = gm.StudentID and sm.StudentID = gm.StudentID 
			Where 
				gm.GroupID=@GroupID and cs.ContentTypeID = 5 and (cs.ContentSubmissionDate >=@StartDate and cs.ContentSubmissionDate <=@EndDate) 
		END	
	IF (@GroupID <> 0 AND @StudentID <> 0)
		BEGIN 
			SELECT
			cs.ContentSubmissionDate,
			cs.Topic,
			cs.Wordcount ,
			en.StudentID,
			sm.StudentName,
			gm.GroupID ,
			gm.GroupName 
			FROM rpt_ContentSubmission cs 
			inner join rpt_Enrollment en ON
			cs.EnrollmentID = en.EnrollmentID 
			inner join rpt_StudentMaster sm ON
			en.StudentID = sm.StudentID and cs.EnrollmentID = en.EnrollmentID 
			inner join rpt_GroupMaster gm ON en.StudentID = gm.StudentID and sm.StudentID = gm.StudentID 
			Where 
				en.StudentID =@StudentID and gm.GroupID=@GroupID and cs.ContentTypeID = 5 and (cs.ContentSubmissionDate >=@StartDate and cs.ContentSubmissionDate <=@EndDate) 
		END		
END

GO