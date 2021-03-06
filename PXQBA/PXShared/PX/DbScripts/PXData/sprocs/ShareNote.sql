
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[ShareNote]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[ShareNote]
END
GO

Create Procedure [dbo].[ShareNote]
(
	@noteId uniqueidentifier,
	@public bit
)
As
Begin
	Update Note
	Set 
		[Public] = @public,
		Modified = GETDATE()
	Where NoteId = @noteId
End
GO
