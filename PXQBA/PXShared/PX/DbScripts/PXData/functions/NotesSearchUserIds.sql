
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NotesSearchUserIds]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
DROP FUNCTION [dbo].[NotesSearchUserIds]
GO

CREATE FUNCTION [dbo].[NotesSearchUserIds](@reqXml xml)
RETURNS @userTable TABLE (UserId NVARCHAR(50), DataType NVARCHAR(50))
AS
BEGIN

	declare @users table ( UserId nvarchar(50), DataType nvarchar(50) )
	
	declare @myNotes bit,
			@myHighlights bit,
			@instNotes bit,
			@instHighlights bit,
			@courseId nvarchar(50),
			@itemId nvarchar(50),
			@highlightId nvarchar(50),
			@highlightPublic bit,
			@highlightStatus nvarchar(50),
			@noteId nvarchar(50),
			@notePublic bit,
			@noteType int,
			@userId nvarchar(50),
			@currentUserId nvarchar(50),
			@notesDt nvarchar(50),
			@highlightsDt nvarchar(50),
			@currentUserType int,
			@reviewId nvarchar(50),
			@enrollmentId nvarchar(50)
			
	set @notesDt = 'notes'
	set @highlightsDt = 'highlights'
			
	select @courseId = Node.value('courseId[1]', 'nvarchar(50)'),
		   @itemId = Node.value('itemId[1]', 'nvarchar(50)'),
		   @highlightId = Node.value('highlightId[1]', 'nvarchar(50)'),
		   @highlightPublic = Node.value('highlightPublic[1]', 'bit'),
		   @highlightStatus = Node.value('highlightStatus[1]', 'int'),
		   @noteId = Node.value('noteId[1]', 'nvarchar(50)'),
		   @notePublic = Node.value('notePublic[1]', 'bit'),
		   @noteType = Node.value('noteType[1]', 'int'),
		   @currentUserId = Node.value('currentUserId[1]', 'nvarchar(50)'),
		   @userId = Node.value('userId[1]', 'nvarchar(50)'),
		   @reviewId = Node.value('reviewId[1]', 'VARCHAR(50)'),
		   @enrollmentId = Node.value('enrollmentId[1]', 'nvarchar(50)')	
	from @reqXml.nodes('/notesSearch') TempXML (Node)
			
	select @myNotes = ShowMyNotes,
		   @myHighlights = ShowMyHighlights,
		   @instNotes = ShowInstructorNotes,
		   @instHighlights = ShowInstructorHighlights
	from UserNoteSettings
	where UserId = @currentUserId and CourseId = @courseId
	
	select @currentUserType = [Type]
	from UserTypes
	where UserId = @currentUserId
	
	-- return my notes
	if @myNotes = 1
	begin
		insert into @users (UserId, DataType) values (@currentUserId, @notesDt)
	end
	
	-- return my highlights
	if @myHighlights = 1
	begin
		insert into @users (UserId, DataType) values (@currentUserId, @highlightsDt)
	end
	
	-- return all instructors notes
	if @instNotes = 1
	begin
		insert into @users
			select UserId, @notesDt
			from UserTypes
			where [Type] = 0 and CourseId = @courseId
	end
	
	-- return all instructor highlights
	if @instHighlights = 1
	begin
		insert into @users
			select UserId, @highlightsDt
			from UserTypes
			where [Type] = 0 and CourseId = @courseId
	end	
	
	-- return all shared notes
	insert @users
		select UserId, @notesDt
		from UserShares
		where SharedUserId = @currentUserId and CourseId = @courseId and NotesEnabled = 1
		
	-- return all shared highlights
	insert @users
		select UserId, @highlightsDt
		from UserShares
		where SharedUserId = @currentUserId and CourseId = @courseId and HighlightsEnabled = 1
	
	if @reviewId is not null and @userId is not null
	begin
		insert @users
			select UserId, @notesDt
			from UserTypes
			where [Type] = 1 and CourseId = @courseId and UserId = @userId
			
		insert @users
			select UserId, @highlightsDt
			from UserTypes
			where [Type] = 1 and CourseId = @courseId and UserId = @userId
	end
	else if @reviewId is not null and @currentUserType = 0
	begin
		insert @users
			select UserId, @notesDt
			from UserTypes
			where [Type] = 1 and CourseId = @courseId
			
		insert @users
			select UserId, @highlightsDt
			from UserTypes
			where [Type] = 1 and CourseId = @courseId
	end
	
	-- make sure only unique records are returned
	insert @userTable
		select distinct UserId, DataType
		from @users	
	
	RETURN
END
GO

--select * from NotesSearchUserIds('<notesSearch><courseId>19729</courseId><itemId>hockenbury5e_1_1_7</itemId><highlightType>GeneralContent</highlightType><noteType>0</noteType><currentUserId>46</currentUserId><userId>46</userId><highlightStatus>-1</highlightStatus></notesSearch>')