
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[AddHighlight]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[AddHighlight]
END
GO

CREATE Procedure [dbo].[AddHighlight]
(
	@highlightText nvarchar(max),
	@description nvarchar(300),
	@highlightType int,
	@itemId nvarchar(50),
	@reviewId nvarchar(50),
	@enrollmentId nvarchar(50),
	@courseId nvarchar(50),
	@public bit = 0,
	@userId nvarchar(50),
	@firstName nvarchar(50),
	@lastName nvarchar(50),
	@color nvarchar(50),
	@start nvarchar(1000),
	@startOffset int,
	@end nvarchar(1000),
	@endOffset int,
	@highlightId uniqueidentifier = NULL OUT
)
As
Begin
	BEGIN TRANSACTION;
	BEGIN TRY
		IF NOT EXISTS(Select UserId From Users Where UserId = @userId)
		Begin
			Insert Into Users(UserId,FirstName,LastName)
			Values(@userId,@firstName,@lastName)
		End		
		
		If @highlightId IS NULL
		Begin
			Set @highlightId = NEWID()
		End
		
		Insert Into Highlights(HighlightId,[Text],[Description],[Public],[Status],UserId,Color,[Start],[StartOffset],[End],[EndOffset])
		Values(@highlightId,@highlightText,@description,@public,0,@userId, @color, @start, @startOffset, @end, @endOffset)
		
		IF @highlightType = 1 -- Regular E book highlight
		Begin
			Insert Into ItemHighlights(HighlightId,ItemId,CourseId)
			Values(@highlightId,@itemId,@courseId)
		End
		ELSE IF @highlightType = 2 -- Writing Assignment Submission highlight
		Begin
			Insert Into SubmissionHighlights(HighlightId,ItemId,EnrollmentId)
			Values(@highlightId,@itemId,@enrollmentId)
		End
		ELSE IF @highlightType = 3 -- Peer Review highlight
		Begin
			Insert Into ReviewHighlights(HighlightId,ReviewId,ItemId,EnrollmentId)
			Values(@highlightId,@reviewId,@itemId,@enrollmentId)
		End
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
End

GO
