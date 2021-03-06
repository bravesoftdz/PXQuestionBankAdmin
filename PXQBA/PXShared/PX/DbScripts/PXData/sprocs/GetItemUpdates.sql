
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[GetItemUpdates]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[GetItemUpdates]
END
GO

CREATE PROCEDURE [dbo].[GetItemUpdates]
(
	@enrollmentId nvarchar(50),
	@status tinyint = 1
)
AS
BEGIN
	SELECT 
		CourseId,
		EnrollmentId,
		ItemId 
	FROM
		dbo.[ItemUpdates]
	WHERE 
		EnrollmentId = @enrollmentId AND 
		[Status] = @status
END

GO
