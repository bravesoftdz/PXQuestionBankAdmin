
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[UpdateHighlightStatus]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[UpdateHighlightStatus]
END
GO

CREATE Procedure [dbo].[UpdateHighlightStatus]
(
	@highlightId uniqueidentifier = NULL,
	@userId nvarchar(50) = NULL,
	@itemId nvarchar(50) = NULL,
	@reviewId nvarchar(50) = NULL,
	@courseId nvarchar(50) = NULL,
	@enrollmentId nvarchar(50) = NULL,
	@updateOnlyEmptyHighlights bit = 0,
	@status int
)
As
Begin

	create table #HighlightsToUpdate (
		hid uniqueidentifier
	)
	
	if @highlightId is not NULL
	begin
		--specific highlight is being updated
		insert #HighlightsToUpdate
		select h.HighlightId as hid
		from Highlights h
		where HighlightId = @highlightId
	end
	
	if @itemId is not NULL and @courseId is not NULL and @reviewId is NULL
	begin
		--all highlights attached to an item are being updated
		insert #HighlightsToUpdate
		select h.HighlightId as hid			
		from Highlights h
				inner join
			 ItemHighlights ih on h.HighlightId = ih.HighlightId 
	    where ih.ItemId = @itemId and ih.CourseId = @courseId and h.UserId = @userId
	end
	
	if @itemId is not NULL and @reviewId is not NULL and @enrollmentId is not NULL
	begin
		--all highlights attached to a review		
		insert #HighlightsToUpdate
		select h.HighlightId as hid
		from Highlights h
				inner join
			 ReviewHighlights ih on h.HighlightId = ih.HighlightId
	    where ih.ItemId = @itemId and ih.ReviewId = @reviewId and ih.EnrollmentId = @enrollmentId and h.UserId = @userId
	end
	
	if @itemId is not NULL and @enrollmentId is not null and @reviewId is NULL
	begin
		--all highlights attached to a submission
		insert #HighlightsToUpdate
		select h.HighlightId as hid	
		from Highlights h
				inner join
			 SubmissionHighlights ih on h.HighlightId = ih.HighlightId
	    where ih.ItemId = @itemId and ih.EnrollmentId = @enrollmentId and h.UserId = @userId
	end
	
	if @updateOnlyEmptyHighlights = 1
	begin
		delete from #HighlightsToUpdate
		Where hid not in
		(
			Select hu.hid From #HighlightsToUpdate hu
			left outer join HighlightNotes hn on hu.hid = hn.HighlightId
			left outer join Note n on n.NoteId = hn.NoteId and n.[Status] <> @status
			group by hu.hid
			having COUNT(n.NoteId) < 1
		)
	end
	
	declare @userType int = 0
	if @userId is not null
	begin
		select @userType = [Type] from UserTypes where UserId = @userId and CourseId = @courseId
	end
	
	Update Highlights
	Set 
		[Status] = @status,
		Modified = GETDATE()
    from Highlights h inner join #HighlightsToUpdate hu on h.HighlightId = hu.hid
	where @userType = 0 or h.[Status] <> 1
	
	drop table #HighlightsToUpdate
End
GO
