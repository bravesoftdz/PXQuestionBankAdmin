
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[AddNote]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[AddNote]
END
GO

CREATE Procedure [dbo].[AddNote]
(
	@noteID uniqueidentifier = NULL,
	@noteText nvarchar(max),
	@description nvarchar(300),
	@noteType int,
	@isGeneralNote bit,
	@itemId nvarchar(50),
	@reviewId nvarchar(50),
	@enrollmentId nvarchar(50),
	@public bit = 0,
	@userId nvarchar(50),
	@firstName nvarchar(50),
	@lastName nvarchar(50),
	@courseId nvarchar(50)
)
As
Begin	
	IF NOT EXISTS(Select UserId From Users Where UserId = @userId)
	Begin
		Insert Into Users(UserId,FirstName,LastName)
		Values(@userId,@firstName,@lastName)
	End
	
	If @noteID IS NULL
	Begin
		Set @noteID = NEWID()
	End
	
	Insert Into Note(NoteId,UserId,Text,[Description],[Public])
	Values(@noteID,@userId,@noteText,@description,@public)
	
	If @isGeneralNote = 1
	Begin
		If @noteType = 1 -- Regular E book highlight
		Begin
			Insert Into ItemNotes(ItemId,NoteId,CourseId)
			Values(@itemId,@noteID,@courseId)
		End
		Else If @noteType = 2 -- Writing Assignment Submission highlight
		Begin
			Insert Into SubmissionNotes(NoteId,ItemId,EnrollmentId)
			Values(@noteID,@itemId,@enrollmentId)
		End
		Else If @noteType = 3 -- Peer Review highlight
		Begin
			Insert Into ReviewNotes(NoteId,ReviewId,ItemId,EnrollmentId)
			Values(@noteID,@reviewId,@itemId,@enrollmentId)
		End
	End	
End
GO
