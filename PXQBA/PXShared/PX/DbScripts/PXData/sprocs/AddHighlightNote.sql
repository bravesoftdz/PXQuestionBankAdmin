
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[AddHighlightNote]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[AddHighlightNote]
END
GO

CREATE Procedure [dbo].[AddHighlightNote]
(
	@highlightText nvarchar(max),
	@description nvarchar(300),
	@noteText nvarchar(max),
	@highlightType int,
	@itemId nvarchar(50),
	@reviewId nvarchar(50),
	@enrollmentId nvarchar(50),
	@courseId nvarchar(50),
	@userId nvarchar(50),
	@firstName nvarchar(50),
	@lastName nvarchar(50),
	@color nvarchar(50),
	@highlightpublic bit,
	@notepublic bit,
	@highlightId uniqueidentifier OUT,
	@noteId uniqueidentifier OUT
)
AS
BEGIN
	BEGIN TRANSACTION;
	BEGIN TRY
		Set @highlightId = NEWID()
		Set @noteId = NEWID()
		EXEC dbo.AddHighlight @highlightText,@description,@highlightType,@itemId,@reviewId,@enrollmentId,@courseId,@highlightpublic,@userId,@firstName,@lastName,@color,@highlightId OUT
		EXEC dbo.AddNote @noteId,@noteText,@description,@highlightType,0,@itemId,@reviewId,@enrollmentId,@notepublic,@userId,@firstName,@lastName, @courseId
		EXEC dbo.SetHighlightNoteRelation @highlightId,@noteId
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0
		BEGIN
			ROLLBACK TRANSACTION;
			DECLARE @ErrorMessage NVARCHAR(4000);
			SELECT @ErrorMessage = ERROR_MESSAGE();
			RAISERROR (@ErrorMessage, 16, 1);
		END
	END CATCH
	IF @@TRANCOUNT > 0
		COMMIT TRANSACTION;
END
GO
