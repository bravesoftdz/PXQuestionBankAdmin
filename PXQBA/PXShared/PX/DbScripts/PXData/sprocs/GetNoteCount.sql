
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[GetNoteCount]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[GetNoteCount]
END
GO

CREATE PROCEDURE [dbo].[GetNoteCount]
(
	@itemId varchar(50) = '',
	@reviewId varchar(50) = '',
	@courseId varchar(50) = '',
	@userId varchar(50) = '',
	@enrollmentId varchar(50) = '', 
	@highlightType int
)
AS
BEGIN
	SET NOCOUNT ON
	Declare
		@hCount int, 
		@nCount int

	IF @highlightType = 1
	BEGIN
		SELECT @hCount = COUNT(1)
		FROM ItemHighlights ih
		INNER JOIN Highlights h ON h.HighlightId = ih.HighlightId
		Where   (@itemId = '' OR ih.ItemId = @itemId) AND
				(@courseId = '' OR @courseId = ih.CourseId) AND
				(@userId = '' OR @userId = h.UserId) AND [Status] <> 2

		SELECT @nCount = COUNT(1)
		From Note n
		INNER JOIN HighlightNotes hn ON hn.NoteId = n.NoteId
		INNER JOIN ItemHighlights ih ON ih.HighlightId = hn.HighlightId
		Where	(@itemId = '' OR @itemId = ih.ItemId) AND
				(@courseId = '' OR @courseId = ih.CourseId) AND
				(@userId = '' OR @userId = n.UserId) AND [Status] <> 2

		SELECT @nCount += COUNT(1)
		From Note n
		INNER JOIN ItemNotes iNotes ON iNotes.NoteId = n.NoteId
		Where	(@itemId = '' OR @itemId = iNotes.ItemId) AND
				(@courseId = '' OR @courseId = iNotes.CourseId) AND
				(@userId = '' OR @userId = n.UserId) AND [Status] <> 2
	END
	ELSE IF @highlightType = 2
	BEGIN
		SELECT @hCount = COUNT(1)
		FROM SubmissionHighlights sh
		INNER JOIN Highlights h ON h.HighlightId = sh.HighlightId
		Where   (@itemId = '' OR @itemId = sh.ItemId) AND
				(@userId = '' OR @userId = h.UserId) AND
				(@enrollmentId = '' OR @enrollmentId = sh.EnrollmentId) AND [Status] <> 2
				
		SELECT @hCount += COUNT(1)
		FROM ReviewHighlights rh
		INNER JOIN Highlights h ON h.HighlightId = rh.HighlightId
		Where   (@itemId = '' OR @itemId = rh.ItemId) AND	
				(@userId = '' OR @userId = h.UserId) AND
				(@enrollmentId = '' OR @enrollmentId = rh.EnrollmentId) AND [Status] <> 2
				
		SELECT @nCount = COUNT(1)
		From Note n
		INNER JOIN HighlightNotes hn ON hn.NoteId = n.NoteId
		INNER JOIN SubmissionHighlights sh ON sh.HighlightId = hn.HighlightId
		Where	(@itemId = '' OR @itemId = sh.ItemId) AND
				(@userId = '' OR @userId = n.UserId) AND
				(@enrollmentId = '' OR @enrollmentId = sh.EnrollmentId)	 AND [Status] <> 2
						
		SELECT @nCount += COUNT(1)
		From Note n
		INNER JOIN HighlightNotes hn ON hn.NoteId = n.NoteId
		INNER JOIN ReviewHighlights rh ON rh.HighlightId = hn.HighlightId
		Where	(@itemId = '' OR @itemId = rh.ItemId) AND
				(@userId = '' OR @userId = n.UserId) AND
				(@enrollmentId = '' OR @enrollmentId = rh.EnrollmentId)	 AND [Status] <> 2
				
		SELECT @nCount += COUNT(1)
		From Note n
		INNER JOIN SubmissionNotes sn ON sn.NoteId = n.NoteId
		Where	(@itemId = '' OR @itemId = sn.ItemId) AND
				(@userId = '' OR @userId = n.UserId) AND
				(@enrollmentId = '' OR @enrollmentId = sn.EnrollmentId) AND [Status] <> 2
				
		SELECT @nCount += COUNT(1)
		From Note n
		INNER JOIN ReviewNotes rn ON rn.NoteId = n.NoteId
		Where	(@itemId = '' OR @itemId = rn.ItemId) AND
				(@userId = '' OR @userId = n.UserId) AND
				(@enrollmentId = '' OR @enrollmentId = rn.EnrollmentId) AND [Status] <> 2
	END
	ELSE IF @highlightType = 3
	BEGIN
		SELECT @hCount = COUNT(1)
		FROM ReviewHighlights rh
		INNER JOIN Highlights h ON h.HighlightId = rh.HighlightId
		Where   (@reviewId = '' OR rh.ReviewId = @reviewId) AND
				(@enrollmentId = '' OR @enrollmentId = rh.EnrollmentId) AND
				(@userId = '' OR @userId = h.UserId) AND [Status] <> 2

		SELECT @nCount = COUNT(1)
		From Note n
		INNER JOIN HighlightNotes hn ON hn.NoteId = n.NoteId
		INNER JOIN ReviewHighlights rh ON rh.HighlightId = hn.HighlightId
		Where	(@reviewId = '' OR @reviewId = rh.ReviewId) AND
				(@enrollmentId = '' OR @enrollmentId = rh.EnrollmentId) AND
				(@userId = '' OR @userId = n.UserId) AND [Status] <> 2

		SELECT @nCount += COUNT(1)
		From Note n
		INNER JOIN ReviewNotes rn ON rn.NoteId = n.NoteId
		Where	(@reviewId = '' OR rn.ReviewId = @reviewId) AND
				(@enrollmentId = '' OR rn.EnrollmentId = @enrollmentId) AND
				(@userId = '' OR @userId = n.UserId) AND [Status] <> 2
	END

	SELECT @hCount AS HighlightCount,@nCount AS NoteCount
END
GO