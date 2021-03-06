
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[AddNoteToHighlight]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[AddNoteToHighlight]
END
GO

CREATE Procedure [dbo].[AddNoteToHighlight]
(
	@highlightId uniqueidentifier,
	@noteText nvarchar(max),
	@description nvarchar(300),
	@noteType int,
	@itemId nvarchar(50),
	@reviewId nvarchar(50),
	@enrollmentId nvarchar(50),
	@public bit = 0,
	@userId nvarchar(50),
	@firstName nvarchar(50),
	@lastName nvarchar(50),
	@courseId nvarchar(50),
	@noteId uniqueidentifier OUT
)
As
Begin
	
	Set @noteID = NEWID()
	EXEC dbo.AddNote @noteId,@noteText,@description,@noteType,0,@itemId,@reviewId,@enrollmentId,@public,@userId,@firstName,@lastName, @courseId
	EXEC dbo.SetHighlightNoteRelation @highlightId,@noteId
	
End
GO
