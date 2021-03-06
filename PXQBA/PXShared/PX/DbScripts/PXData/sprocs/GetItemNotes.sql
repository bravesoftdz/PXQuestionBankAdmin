
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[GetItemNotes]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[GetItemNotes]
END
GO

CREATE PROCEDURE [dbo].[GetItemNotes](@reqXml XML)
AS
BEGIN

	-- stores records for all notes being returned
	CREATE TABLE #notesTbl(
				[TopNoteId] UNIQUEIDENTIFIER, [HighlightId] UNIQUEIDENTIFIER,[NoteId] UNIQUEIDENTIFIER,[UserId] VARCHAR(50),[Text] VARCHAR(MAX),[Description] NVARCHAR(300),
				[Public] BIT,[Status] int,[ItemId] VARCHAR(50),[CourseId] VARCHAR(50),[FirstName] VARCHAR(50),[LastName] VARCHAR(50),
				[Created] DATETIME,[Modified] DATETIME)				
	
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
		@currentUserId nvarchar(50)
		
	select @courseId = Node.value('courseId[1]', 'nvarchar(50)'),
		   @itemId = Node.value('itemId[1]', 'nvarchar(50)'),
		   @highlightId = Node.value('highlightId[1]', 'nvarchar(50)'),
		   @highlightPublic = Node.value('highlightPublic[1]', 'bit'),
		   @highlightStatus = Node.value('highlightStatus[1]', 'int'),
		   @noteId = Node.value('noteId[1]', 'nvarchar(50)'),
		   @notePublic = Node.value('notePublic[1]', 'bit'),
		   @noteType = Node.value('noteType[1]', 'int'),
		   @currentUserId = Node.value('currentUserId[1]', 'nvarchar(50)')		   
	from @reqXml.nodes('/notesSearch') TempXML (Node)

	IF @noteType <> 2
	BEGIN
		
		if @courseId is not null and @itemId is not null and @highlightId is not null
		begin
			-- get a specific highlight regardless of status and public
			insert #highlightTbl
				select ih.HighlightId
				from ItemHighlights ih
				where ih.CourseId = @courseId and ih.ItemId = @itemId and ih.HighlightId = @highlightId
		end
		else if @noteId is not null
		begin
			-- get a specific highlight for note id regardless of status and public
			insert #highlightTbl
				select hn.HighlightId
				from HighlightNotes hn
				where hn.NoteId = @noteId
		end
		else if @courseId is not null and @itemId is not null
		begin
			-- only load our own private highlights
			insert #highlightTbl
				select ih.HighlightId
				from ItemHighlights ih
						inner join
					 Highlights h on h.HighlightId = ih.HighlightId
						inner join
					 #UserIds ui on ui.UserId = h.UserId and ui.DataType = 'highlights'
				where ih.CourseId = @courseId and ih.ItemId = @itemId and h.[Public] = 0 and h.[Status] <> 2 and h.UserId = @currentUserId
			
			-- all shared highlights
			insert #highlightTbl
				select ih.HighlightId
				from ItemHighlights ih
						inner join
					 Highlights h on h.HighlightId = ih.HighlightId
						inner join
					 #UserIds ui on ui.UserId = h.UserId and ui.DataType = 'highlights'
				where ih.CourseId = @courseId and ih.ItemId = @itemId and h.[Public] = 1 and h.[Status] <> 2
		end

		-- return data for all matching, non-deleted highlights
		-- public highlights are always returned, but private highlights are only returned if the UserId that owns the highlights
		-- is in the #UserIds table
		select h.HighlightId,h.[Text],h.[Description],h.[Public],h.[Status],@itemId as ItemId,h.UserId,u.FirstName,u.LastName, h.Color, h.Created,h.Modified, h.[Start], h.StartOffset, h.[End], h.EndOffset
		from Highlights h				
				inner join
			 #highlightTbl ih ON ih.HighlightId = h.HighlightId	
				inner join
			 Users u ON h.UserId = u.UserId
			
		-- get any notes attached to the selected highlights, restricted by user
		insert into #notesTbl
		select null as topNoteId, hn.HighlightId,n.NoteId,n.UserId,n.[Text],n.[Description],n.[Public],n.[Status],@itemId as ItemId, @courseId as CourseId,u.FirstName,u.LastName,n.Created,n.Modified
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
		insert into #notestbl
		select topNotes.TopNoteId, null as highlightid,n.NoteId,n.UserId,n.[text],n.[Description],n.[Public],n.[Status],inotes.ItemId,inotes.CourseId,u.FirstName,u.LastName,n.Created,n.Modified
		from note n
				inner join 
			 ItemNotes inotes on inotes.NoteId = n.NoteId
				inner join 
			 Users u on n.UserId = u.UserId
				inner join
			 #UserIds ui on ui.userid = u.userid and ui.datatype = 'notes' and (ui.userid = @currentUserId or n.[public] = 1)
				left outer join
			 TopNotes topNotes on topNotes.NoteId = n.Noteid	
		where (inotes.CourseId = @courseid) and (inotes.[ItemId] = @itemId) and (n.[Status] <> 2) and 
			  (@noteId is null or n.NoteId = @noteId)

		-- add top notes responses --
		INSERT INTO #notestbl
		SELECT [topNotes].[TopNoteId], null as [highlightid],[n].[NoteId],[n].[UserId],[n].[text],[n].[Description],[n].[Public],[n].[Status],[tbl].[ItemId],[tbl].[CourseId],[u].[FirstName],[u].[LastName],[n].[Created],[n].[Modified]
		FROM 
			#notestbl [tbl]
				INNER JOIN
			[TopNotes] [topNotes] on [topNotes].[TopNoteId] = [tbl].[NoteId]
				INNER JOIN
			[Note] [n] on [n].[NoteId] = [topnotes].[NoteId] and (n.[UserId] = @currentUserId or n.[public] = 1) and n.[Status] <> 2
				INNER JOIN
			[Users] [u] on [n].[UserId] = [u].[UserId]

	END
	SELECT distinct * FROM #notesTbl
	DROP TABLE #notesTbl
	DROP TABLE #highlightTbl
	DROP TABLE #UserIds
END

GO
-- GetItemNotes '<notesSearch><courseId>19729</courseId><itemId>hockenbury5e_1_1_7</itemId><highlightType>GeneralContent</highlightType><noteType>0</noteType><currentUserId>46</currentUserId><userId>46</userId><highlightStatus>-1</highlightStatus></notesSearch>'