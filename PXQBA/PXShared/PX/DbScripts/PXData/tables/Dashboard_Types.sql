GO

SET ANSI_PADDING OFF
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.[Dashboard_Types]','U') IS NULL
BEGIN
CREATE TABLE [dbo].[Dashboard_Types](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Dashboard_type] [varchar](150) NULL,
 CONSTRAINT [PK_Dashboard_Types] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
END
