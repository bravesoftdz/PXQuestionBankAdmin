
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[GetNotesByUser]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[GetNotesByUser]
END
GO
CREATE Procedure [dbo].[GetNotesByUser]
(
	@highlightType int,
	@userId varchar(50),
	@courseId varchar(50),
	@enrollmentId varchar(50)
)
as
begin
	if @highlightType = 1
	begin	
		select hn.HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],ih.ItemId,ih.CourseId,n.Created,n.Modified
		from Note n
		inner join HighlightNotes hn on hn.NoteId = n.NoteId
		inner join ItemHighlights ih on hn.HighlightId = ih.HighlightId
		where n.UserId = @userId and ih.CourseId = @courseId
		union all
		select null as HighlightId, n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],iNotes.ItemId,iNotes.CourseId,n.Created,n.Modified
		from Note n
		inner join ItemNotes iNotes on iNotes.NoteId = n.NoteId
		where n.UserId = @userId and iNotes.CourseId = @courseId
	end
	else if @highlightType = 2
	begin
		select hn.HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],sh.ItemId,sh.EnrollmentId,n.Created,n.Modified
		from Note n
		inner join HighlightNotes hn on hn.NoteId = n.NoteId
		inner join SubmissionHighlights sh on hn.HighlightId = sh.HighlightId
		where sh.EnrollmentId = @enrollmentId
		union all
		select null as HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],sn.ItemId,sn.EnrollmentId,n.Created,n.Modified
		from Note n
		inner join SubmissionNotes sn on sn.NoteId = n.NoteId
		where sn.EnrollmentId = @enrollmentId
	end
	else if @highlightType = 3
	begin
		select hn.HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],rh.ReviewId,rh.ItemId,rh.EnrollmentId,n.Created,n.Modified
		from Note n
		inner join HighlightNotes hn on hn.NoteId = n.NoteId
		inner join ReviewHighlights rh on hn.HighlightId = rh.HighlightId
		where rh.EnrollmentId = @enrollmentId
		union all
		select null as HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],rn.ReviewId,rn.ItemId,rn.EnrollmentId,n.Created,n.Modified
		from Note n
		inner join ReviewNotes rn on rn.NoteId = n.NoteId
		where rn.EnrollmentId = @enrollmentId
	end
end
go