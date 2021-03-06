
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[GetSubmissionNotes]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[GetSubmissionNotes]
END
GO

CREATE PROCEDURE [dbo].[GetSubmissionNotes](@reqXml XML)
AS
BEGIN
	CREATE TABLE #notesTbl(
				HighlightId UNIQUEIDENTIFIER,NoteId UNIQUEIDENTIFIER,UserId VARCHAR(50),[Text] VARCHAR(MAX),[Description] NVARCHAR(300),
				[Public] BIT,[Status] int,ItemId VARCHAR(50),EnrollmentId VARCHAR(50),FirstName VARCHAR(50),LastName VARCHAR(50),
				Created DATETIME,Modified DATETIME, ReviewId nvarchar(50))				
	
	create table #highlightTbl (
		HighlightId uniqueidentifier
	)
	
	SELECT * INTO #UserIds FROM NotesSearchUserIds(@reqXml)
	
	declare @courseId nvarchar(50),
		@itemId nvarchar(50),
		@highlightId nvarchar(50),
		@highlightPublic bit,
		@highlightStatus nvarchar(50),
		@noteId nvarchar(50),
		@notePublic bit,
		@noteType int,
		@currentUserId nvarchar(50),
		@enrollmentId nvarchar(50)
		
	select @courseId = Node.value('courseId[1]', 'nvarchar(50)'),
		   @itemId = Node.value('itemId[1]', 'nvarchar(50)'),
		   @highlightId = Node.value('highlightId[1]', 'nvarchar(50)'),
		   @highlightPublic = Node.value('highlightPublic[1]', 'bit'),
		   @highlightStatus = Node.value('highlightStatus[1]', 'int'),
		   @noteId = Node.value('noteId[1]', 'nvarchar(50)'),
		   @notePublic = Node.value('notePublic[1]', 'bit'),
		   @noteType = Node.value('noteType[1]', 'int'),
		   @currentUserId = Node.value('currentUserId[1]', 'nvarchar(50)'),
		   @enrollmentId = Node.value('enrollmentId[1]', 'nvarchar(50)')	   
	from @reqXml.nodes('/notesSearch') TempXML (Node)
	
	IF @reqXml.value('(/notesSearch/noteType)[1]', 'int' ) <> 2
	BEGIN
	
		if @enrollmentId is not null and @itemId is not null and @highlightId is not null
		begin
			-- get a specific highlight regardless of status and public
			insert #highlightTbl
				select ih.HighlightId
				from SubmissionHighlights ih
				where ih.EnrollmentId = @enrollmentId and ih.ItemId = @itemId and ih.HighlightId = @highlightId
		end
		else if @noteId is not null
		begin
			-- get a specific highlight for note id regardless of status and public
			insert #highlightTbl
				select hn.HighlightId
				from HighlightNotes hn
				where hn.NoteId = @noteId
		end
		else if @enrollmentId is not null and @itemId is not null
		begin
			-- only load our own private highlights
			insert #highlightTbl
				select ih.HighlightId
				from SubmissionHighlights ih
						inner join
					 Highlights h on h.HighlightId = ih.HighlightId
						inner join
					 #UserIds ui on ui.UserId = h.UserId and ui.DataType = 'highlights'
				where ih.EnrollmentId = @enrollmentId and ih.ItemId = @itemId and h.[Public] = 0 and h.[Status] <> 2 and h.UserId = @currentUserId
				
			-- all shared highlights directly on this submission
			insert #highlightTbl
				select ih.HighlightId
				from SubmissionHighlights ih
						inner join
					 Highlights h on h.HighlightId = ih.HighlightId
						inner join
					 #UserIds ui on ui.UserId = h.UserId and ui.DataType = 'highlights'
				where ih.EnrollmentId = @enrollmentId and ih.ItemId = @itemId and h.[Public] = 1 and h.[Status] <> 2
				
			-- all shared highlights based on all reviews of this submission
			insert #highlightTbl
				select ih.HighlightId
				from ReviewHighlights ih
						inner join
					 Highlights h on h.HighlightId = ih.HighlightId
				where ih.EnrollmentId = @enrollmentId and ih.ItemId = @itemId and h.[Public] = 1 and h.[Status] <> 2
		end
	
		-- return data for all matching, non-deleted highlights
		-- public highlights are always returned, but private highlights are only returned if the UserId that owns the highlights
		-- is in the #UserIds table 
		-- changed the below code to get the review id also ..
		select h.HighlightId,h.[Text],h.[Description],h.[Public],h.[Status],@itemId as ItemId,h.UserId,u.FirstName,u.LastName, h.Color, h.Created,
		h.Modified, rh.ReviewId,
		h.Start, h.StartOffset, h.[End], h.EndOffset 
		from Highlights h				
				inner join
			 #highlightTbl ih ON ih.HighlightId = h.HighlightId	
				inner join
			 Users u ON h.UserId = u.UserId 
			    left outer join 
			 ReviewHighlights rh ON rh.HighlightId = h.HighlightId
			 			 

		-- get any notes attached to the selected highlights
		insert into #notesTbl
		select hn.HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],@itemId as ItemId, @enrollmentId as EnrollmentId,u.FirstName,
		u.LastName,n.Created,n.Modified, rn.ReviewId
		from #highlightTbl ht
				inner join
			 HighlightNotes hn on ht.HighlightId = hn.HighlightId
				inner join
			 Note n on n.NoteId = hn.NoteId
				inner join
			 Users u on n.UserId = u.UserId 
				left outer join 
			 ReviewNotes rn ON rn.NoteId = n.NoteId
		where n.[Status] <> 2		
		
	END
	
	IF @reqXml.value('(/notesSearch/noteType)[1]', 'int' ) <> 1
	BEGIN
		
		-- get any notes attached directly to the submission
		INSERT INTO #notesTbl
		SELECT NULL AS HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],iNotes.ItemId,iNotes.EnrollmentId,u.FirstName,
		u.LastName,n.Created,n.Modified,  null as ReviewId 
		
		FROM Note n
				INNER JOIN 
			 SubmissionNotes iNotes ON iNotes.NoteId = n.NoteId
				INNER JOIN 
			 Users u ON n.UserId = u.UserId 
				--inner join
			 --#UserIds ui on (ui.UserId = u.UserId and ui.DataType = 'notes')	or (n.[Public] = 1)
		WHERE (iNotes.EnrollmentId = @enrollmentId) AND (iNotes.[ItemId] = @itemId) AND (n.[Status] <> 2) and
			  (@noteId is null or n.NoteId = @noteId)
		
		-- get any notes attached directly to any reviews of the submission
		INSERT INTO #notesTbl
		SELECT NULL AS HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],iNotes.ItemId,iNotes.EnrollmentId,
		u.FirstName,u.LastName,n.Created,n.Modified,iNotes.ReviewId
		FROM Note n
				INNER JOIN 
			 ReviewNotes iNotes ON iNotes.NoteId = n.NoteId
				INNER JOIN 
			 Users u ON n.UserId = u.UserId
				--inner join
			 --#UserIds ui on (ui.UserId = u.UserId and ui.DataType = 'notes')	or (n.[Public] = 1)
		WHERE (iNotes.EnrollmentId = @enrollmentId) AND (iNotes.[ItemId] = @itemId) AND (n.[Status] <> 2) and
			  (@noteId is null or n.NoteId = @noteId)
		
	END
	SELECT * FROM #notesTbl
	
	DROP TABLE #UserIds
	DROP TABLE #notesTbl
	DROP TABLE #highlightTbl
END
GO
