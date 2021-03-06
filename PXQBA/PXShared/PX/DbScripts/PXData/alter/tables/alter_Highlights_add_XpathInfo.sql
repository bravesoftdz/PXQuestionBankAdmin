/*
   Tuesday, March 26, 20134:00:10 PM
   User: pxuser
   Server: 192.168.78.95\SQL2008R2
   Database: PXData2
   Application: 
*/

/* To prevent any potential data loss issues, you should review this script in detail before running it outside the context of the database designer.*/
BEGIN TRANSACTION
SET QUOTED_IDENTIFIER ON
SET ARITHABORT ON
SET NUMERIC_ROUNDABORT OFF
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_NULLS ON
SET ANSI_PADDING ON
SET ANSI_WARNINGS ON
COMMIT
BEGIN TRANSACTION
GO
ALTER TABLE dbo.Highlights ADD
	Start nvarchar(1000) NULL,
	StartOffset int NULL,
	[End] nvarchar(1000) NULL,
	EndOffset int NULL
GO
ALTER TABLE dbo.Highlights SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
