
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[GetReviewNotes]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[GetReviewNotes]
END
GO

CREATE PROCEDURE [dbo].[GetReviewNotes](@reqXml XML)
AS
BEGIN
	CREATE TABLE #notesTbl(HighlightId UNIQUEIDENTIFIER,NoteId UNIQUEIDENTIFIER,UserId VARCHAR(50),[Text] VARCHAR(MAX),[Description] NVARCHAR(300),[Public] BIT,
							[Status] INT,ReviewId VARCHAR(50),ItemId VARCHAR(50),EnrollmentId VARCHAR(50),FirstName VARCHAR(50),
							LastName VARCHAR(50),Created DATETIME,Modified DATETIME)
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
		@reviewId nvarchar(50),
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
		   @reviewId = Node.value('reviewId[1]', 'VARCHAR(50)'),
		   @enrollmentId = Node.value('enrollmentId[1]', 'nvarchar(50)')	
	from @reqXml.nodes('/notesSearch') TempXML (Node)
	
	IF @noteType <> 2
	BEGIN
		
		if @enrollmentId is not null and @itemId is not null and @reviewId is not null and @highlightId is not null
		begin
			-- get a specific highlight regardless of status and public
			insert #highlightTbl
				select ih.HighlightId
				from ReviewHighlights ih
				where ih.EnrollmentId = @enrollmentId and ih.ItemId = @itemId and ih.ReviewId = @reviewId and ih.HighlightId = @highlightId
		end
		else if @noteId is not null
		begin
			-- get a specific highlight for note id regardless of status and public
			insert #highlightTbl
				select hn.HighlightId
				from HighlightNotes hn
				where hn.NoteId = @noteId
		end
		else if @enrollmentId is not null and @itemId is not null and @reviewId is not null
		begin
			-- only load our own private highlights
			insert #highlightTbl
				select ih.HighlightId
				from ReviewHighlights ih
						inner join
					 Highlights h on h.HighlightId = ih.HighlightId
						inner join
					 #UserIds ui on ui.UserId = h.UserId and ui.DataType = 'highlights'
				where ih.EnrollmentId = @enrollmentId and ih.ItemId = @itemId and ih.ReviewId = @reviewId and h.[Public] = 0 and h.[Status] <> 2 and h.UserId = @currentUserId
			
			-- all shared highlights
			insert #highlightTbl
				select ih.HighlightId
				from ReviewHighlights ih
						inner join
					 Highlights h on h.HighlightId = ih.HighlightId
						inner join
					 #UserIds ui on ui.UserId = h.UserId and ui.DataType = 'highlights'
				where ih.EnrollmentId = @enrollmentId and ih.ItemId = @itemId and ih.ReviewId = @reviewId and h.[Public] = 1 and h.[Status] <> 2
		end
		
		-- return data for all matching, non-deleted highlights
		-- public highlights are always returned, but private highlights are only returned if the UserId that owns the highlights
		-- is in the #UserIds table
		select h.HighlightId,h.[Text],h.[Description],h.[Public],h.[Status],rh.ReviewId, @itemId as ItemId,h.UserId,u.FirstName,u.LastName, h.Color, h.Created,
		h.Modified
		from Highlights h				
				inner join
			 #highlightTbl ih ON ih.HighlightId = h.HighlightId	
				inner join
			 Users u ON h.UserId = u.UserId
				 left outer join 
			 ReviewHighlights rh ON rh.HighlightId = h.HighlightId
			
		-- get any notes attached to the selected highlights, restricted by user
		insert into #notesTbl
		select hn.HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],@reviewId as ReviewId, @itemId as ItemId, @enrollmentId as EnrollmentId,u.FirstName,u.LastName,n.Created,n.Modified
		from #highlightTbl ht
				inner join
			 HighlightNotes hn on ht.HighlightId = hn.HighlightId
				inner join
			 Note n on n.NoteId = hn.NoteId
				inner join
			 Users u on n.UserId = u.UserId
		where n.[Status] <> 2		
		
	END
	
	IF @noteType <> 1
	BEGIN
		INSERT INTO #notesTbl
		SELECT NULL AS HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],iNotes.ReviewId, iNotes.ItemId, iNotes.EnrollmentId, u.FirstName,u.LastName,n.Created,n.Modified
		FROM Note n
				INNER JOIN 
			 ReviewNotes iNotes ON iNotes.NoteId = n.NoteId
				INNER JOIN 
			 Users u ON n.UserId = u.UserId
				inner join
			 #UserIds ui on (ui.UserId = u.UserId and ui.DataType = 'notes') --or (n.[Public] = 1)
		WHERE (iNotes.EnrollmentId = @enrollmentId) and (iNotes.ReviewId = @reviewId) AND (iNotes.[ItemId] = @itemId) AND (n.[Status] <> 2) AND
			  (@noteId is null or n.NoteId = @noteId)
	END
	SELECT * FROM #notesTbl
	DROP TABLE #notesTbl
	DROP TABLE #highlightTbl
	DROP TABLE #UserIds
END
GO
