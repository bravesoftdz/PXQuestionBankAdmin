
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[GetItemUpdateCountByEnrollment]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[GetItemUpdateCountByEnrollment]
END
GO

CREATE PROCEDURE [dbo].[GetItemUpdateCountByEnrollment]
(
	@courseId nvarchar(50),
	@status tinyint = 1
)
AS
BEGIN
	SELECT 
		COUNT(1) UpdateCount, 
		EnrollmentId
	FROM 
		dbo.[ItemUpdates]
	WHERE 
		CourseId = @courseId AND 
		[Status] = @status 
	GROUP BY 
		EnrollmentId
END
GO
