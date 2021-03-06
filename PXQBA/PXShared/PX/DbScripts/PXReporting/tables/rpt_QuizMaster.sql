SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.[rpt_QuizMaster]','U') IS NULL
BEGIN
CREATE TABLE [dbo].[rpt_QuizMaster](
	[QuizID] [varchar](100) NOT NULL,
	[QuizTitle] [nvarchar](200) NOT NULL,
	[CourseID] [int] NOT NULL,
 CONSTRAINT [PK_Report_QuizMaster] PRIMARY KEY CLUSTERED 
(
	[QuizID] ASC,
	[CourseID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO



