SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[SP_rptQuizSubmissionDetailold]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[SP_rptQuizSubmissionDetailold]
END
GO


CREATE PROCEDURE [dbo].[SP_rptQuizSubmissionDetailold]
	-- Add the parameters for the stored procedure here
		@StudentID int = null,
		@SubmissionDate datetime =null
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	SELECT cs.ContentSubmissionDate,stm.StatusName,cs.Score,cs.IPAddress,sm.StudentName,en.StudentID ,  
	Str(DateDiff(MI, cts.SessionStartDate,cts.SessionEndDate)/60,2,0) + '  h  ' + Replace(Str(DateDiff(MI, cts.SessionStartDate, cts.SessionEndDate)%60,2,0), ' ', '0')+ '  min' AS SessionLength,
		(SELECT COUNT(cts.ContentSubmissionID) from rpt_ContentSession cts WHERE cts.StatusID =1 and cs.ContentSubmissionDate =@SubmissionDate and en.StudentID =@StudentID ) as TotalSubmissions,
		(SELECT COUNT(cts.ContentSubmissionID) from rpt_ContentSession cts WHERE cts.StatusID =2 and cs.ContentSubmissionDate =@SubmissionDate and en.StudentID =@StudentID ) as SavedSubmissions
	FROM rpt_ContentSubmission cs inner join
		 rpt_Enrollment en ON cs.EnrollmentID = en.EnrollmentID Inner Join
		 rpt_StudentMaster sm ON en.StudentID = sm.StudentID Inner Join
		 rpt_ContentSession cts ON cs.ContentSubmissionID = cts.ContentSubmissionID Inner Join
		 rpt_StatusMaster stm on cts.StatusID = stm.StatusID
	Where sm.StudentID =@StudentID and cs.ContentTypeID =1 and cs.ContentSubmissionDate = @SubmissionDate	 
	group by cts.StatusID,cs.ContentSubmissionDate, cts.SessionStartDate,cts.SessionEndDate,stm.StatusName,cs.Score,cs.IPAddress,sm.StudentName,en.StudentID 

END

GO