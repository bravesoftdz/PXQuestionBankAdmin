SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[SP_rptFileSubmission1]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[SP_rptFileSubmission1]
END
GO

CREATE PROCEDURE [dbo].[SP_rptFileSubmission1] 
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
			fs.FileSubmissionDate,
			en.StudentID,
			sm.StudentName,
			am.AssignmentName, 
			fs.FileName, 
			fs.FileType
			FROM rpt_FileSubmission  fs 
			Inner Join rpt_AssignmentMaster am ON
			fs.AssignmentID = am.AssignmentID 
			inner join rpt_Enrollment en ON
			fs.EnrollmentID = en.EnrollmentID 
			inner join rpt_StudentMaster sm ON
			en.StudentID = sm.StudentID and fs.EnrollmentID = en.EnrollmentID 
			WHERE 
				(fs.FileSubmissionDate  >=@StartDate and fs.FileSubmissionDate <=@EndDate) 
		END
	IF (@GroupID = 0 AND @StudentID <> 0 )
		BEGIN 
			SELECT
			fs.FileSubmissionDate,
			en.StudentID,
			sm.StudentName,
			am.AssignmentName, 
			fs.FileName, 
			fs.FileType
			FROM rpt_FileSubmission  fs 
			Inner Join rpt_AssignmentMaster am ON
			fs.AssignmentID = am.AssignmentID 
			inner join rpt_Enrollment en ON
			fs.EnrollmentID = en.EnrollmentID 
			inner join rpt_StudentMaster sm ON
			en.StudentID = sm.StudentID and fs.EnrollmentID = en.EnrollmentID 
			Where 
				en.StudentID = isnull(@StudentID,en.StudentID) and (fs.FileSubmissionDate  >=@StartDate and fs.FileSubmissionDate <=@EndDate) 
		END
	IF (@GroupID <> 0 AND @StudentID = 0)
		BEGIN 
			SELECT
			fs.FileSubmissionDate,
			en.StudentID,
			sm.StudentName,
			am.AssignmentName, 
			fs.FileName, 
			fs.FileType,
			gm.GroupID ,
			gm.GroupName 
			FROM rpt_FileSubmission  fs 
			Inner Join rpt_AssignmentMaster am ON
			fs.AssignmentID = am.AssignmentID 
			inner join rpt_Enrollment en ON
			fs.EnrollmentID = en.EnrollmentID 
			inner join rpt_StudentMaster sm ON
			en.StudentID = sm.StudentID and fs.EnrollmentID = en.EnrollmentID 
			inner join rpt_GroupMaster gm ON en.StudentID = gm.StudentID and sm.StudentID = gm.StudentID 
			Where 
				gm.GroupID =@GroupID and (fs.FileSubmissionDate  >=@StartDate and fs.FileSubmissionDate <=@EndDate) 
		END
	IF (@GroupID <> 0 AND @StudentID <> 0)
		BEGIN 
			SELECT
			fs.FileSubmissionDate,
			en.StudentID,
			sm.StudentName,
			am.AssignmentName, 
			fs.FileName, 
			fs.FileType,
			gm.GroupID ,
			gm.GroupName 
			FROM rpt_FileSubmission  fs 
			Inner Join rpt_AssignmentMaster am ON
			fs.AssignmentID = am.AssignmentID 
			inner join rpt_Enrollment en ON
			fs.EnrollmentID = en.EnrollmentID 
			inner join rpt_StudentMaster sm ON
			en.StudentID = sm.StudentID and fs.EnrollmentID = en.EnrollmentID 
			inner join rpt_GroupMaster gm ON en.StudentID = gm.StudentID and sm.StudentID = gm.StudentID 
			Where 
				en.StudentID = @StudentID  and	gm.GroupID =@GroupID and (fs.FileSubmissionDate  >=@StartDate and fs.FileSubmissionDate <=@EndDate) 
		END	
END

GO