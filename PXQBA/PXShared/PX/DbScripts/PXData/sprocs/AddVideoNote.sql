SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[AddVideoNote]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[AddVideoNote]
END
GO

CREATE PROCEDURE [dbo].[AddVideoNote]
(			
	 @noteID UNIQUEIDENTIFIER = NULL, 
	 @noteText NVARCHAR(max),  	 	 	 
	 @itemId NVARCHAR(50),  	 	   	 
	 @videoId NVARCHAR(50),
	 @userId NVARCHAR(50),  
	 @firstName NVARCHAR(50),  
	 @lastName NVARCHAR(50),  
	 @courseId NVARCHAR(50),	 
	 @minTime BIGINT ,
	 @maxTime BIGINT,
	 @accessType INT
)
AS
BEGIN	

	IF NOT EXISTS(SELECT UserId FROM Users WHERE UserId = @userId)
	BEGIN
		INSERT INTO Users(UserId,FirstName,LastName)
		VALUES(@userId,@firstName,@lastName)
	END
	
	INSERT INTO VideoNotes
           ([Id]
           ,[CourseId]
           ,[ItemId]
           ,[UserId]
           ,[VideoId]
           ,[Text]           
           ,[Created]
           ,[Modified]
           ,[MinTime]
           ,[MaxTime]
           ,[AccessType]
           )
     VALUES
           (@noteID
           ,@courseId
           ,@itemId
           ,@userId
           ,@videoId
           ,@noteText           
           ,GETDATE()
           ,GETDATE()
           ,@minTime
           ,@maxTime  
           ,@accessType         
           )
           
     RETURN @@identity
	
END

