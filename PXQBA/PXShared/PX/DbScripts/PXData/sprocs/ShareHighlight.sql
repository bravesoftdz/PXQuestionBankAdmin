
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[ShareHighlight]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[ShareHighlight]
END
GO

CREATE Procedure [dbo].[ShareHighlight]
(
	@highlightId uniqueidentifier,
	@public bit
)
As
Begin
	Update Highlights 
	Set 
		[Public] = @public,
		Modified = GETDATE()
	Where HighlightId = @highlightId
	
	Update n
	Set n.[Public] = @public
	From Note n
	Inner Join HighlightNotes hn On hn.NoteId = n.NoteId
	Where hn.HighlightId = @highlightId	
End
GO
-- ShareHighlight '03686C04-7C6A-4ECD-BAB7-1A091F61BFF3', 1