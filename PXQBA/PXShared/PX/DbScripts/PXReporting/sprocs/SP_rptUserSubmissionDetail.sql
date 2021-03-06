SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[SP_rptUserSubmissionDetail]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[SP_rptUserSubmissionDetail]
END
GO


CREATE PROCEDURE [dbo].[SP_rptUserSubmissionDetail]
(
@StudentID int =0
) 
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
	SELECT qs.QuestionID ,qm.QuestionText,qs.EnrollmentID ,qs.StudentAnswer,ad.CorrectAnswer    
	FROM rpt_QuizSubmission qs 
	Inner Join rpt_QuestionMaster qm ON qs.QuestionID = qm.QuestionID 
	Inner Join rpt_AnswerDetail ad ON qs.QuestionID = ad.Questionid 
	WHERE qs.EnrollmentID = @StudentID 
END

GO