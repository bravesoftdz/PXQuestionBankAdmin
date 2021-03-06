SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.[rpt_AssignmentMaster]','U') IS NULL
BEGIN
CREATE TABLE [dbo].[rpt_AssignmentMaster](
	[AssignmentID] [varchar](100) NOT NULL,
	[AssignmentName] [varchar](500) NOT NULL,
	[CourseID] [int] NOT NULL,
 CONSTRAINT [PK_AssignmentMaster] PRIMARY KEY CLUSTERED 
(
	[AssignmentID] ASC,
	[CourseID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO



