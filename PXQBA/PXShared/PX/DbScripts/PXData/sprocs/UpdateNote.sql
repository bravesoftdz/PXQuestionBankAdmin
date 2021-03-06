
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[UpdateNote]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[UpdateNote]
END
GO

Create Procedure [dbo].[UpdateNote]
(
	@noteId uniqueidentifier,
	@noteText nvarchar(max)
)
As
Begin
	Update Note
	Set 
		[Text] = @noteText,
		Modified = GETDATE()
	Where NoteId = @noteId
End
GO
