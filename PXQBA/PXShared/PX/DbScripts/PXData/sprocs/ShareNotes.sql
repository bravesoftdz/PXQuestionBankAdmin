SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[ShareNotes]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[ShareNotes]
END
GO

CREATE PROCEDURE [dbo].[ShareNotes]
(	
	@studentId NVARCHAR(50),
	@courseId NVARCHAR(50),
	@sharedStudentId NVARCHAR(50),
	@firstNameSharer NVARCHAR(50),
	@lastNameSharer NVARCHAR(50),
	@firstNameSharee NVARCHAR(50),
	@lastNameSharee NVARCHAR(50)
)
AS
BEGIN
	BEGIN TRANSACTION;
	BEGIN TRY
		IF NOT EXISTS (SELECT UserId FROM Users WHERE UserId = @studentId)
		BEGIN
			INSERT INTO Users(UserId,FirstName, LastName) VALUES(@studentId, @firstNameSharer, @lastNameSharer)
		END
		IF NOT EXISTS (SELECT UserId FROM Users WHERE UserId = @sharedStudentId)
		BEGIN
			INSERT INTO Users(UserId,FirstName, LastName) VALUES(@sharedStudentId, @firstNameSharee, @lastNameSharee)
		END
		IF NOT EXISTS(SELECT UserId FROM UserShares WHERE UserId = @studentId AND SharedUserId = @sharedStudentId AND CourseId=@courseId)
		BEGIN
			INSERT INTO UserShares(UserId, SharedUserId, CourseId) 
			VALUES(@studentId, @sharedStudentId, @courseId)
			
		END
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
