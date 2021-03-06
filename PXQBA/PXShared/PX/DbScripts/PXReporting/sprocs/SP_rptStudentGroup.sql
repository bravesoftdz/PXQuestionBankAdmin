SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[SP_rptStudentGroup]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[SP_rptStudentGroup]
END
GO

CREATE Procedure [dbo].[SP_rptStudentGroup] 
@StudentID int = NULL
AS
BEGIN
(
select GroupID, GroupName from rpt_GroupMaster
Where Studentid =ISNULL(@StudentID,StudentID) 
)  
END

GO