/*
   Monday, April 15, 20131:31:05 PM
   User: pxuser
   Server: VSPXDBDEV01\SQL2008R2
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
ALTER TABLE dbo.EmailValues
	DROP CONSTRAINT FK_EmailValues_EmailTracking
GO
ALTER TABLE dbo.EmailTracking SET (LOCK_ESCALATION = TABLE)
GO
COMMIT
BEGIN TRANSACTION
GO
CREATE TABLE dbo.Tmp_EmailValues
	(
	TrackingEmailId bigint NOT NULL,
	[Key] varchar(50) NOT NULL,
	Value nvarchar(MAX) NOT NULL
	)  ON [PRIMARY]
	 TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE dbo.Tmp_EmailValues SET (LOCK_ESCALATION = TABLE)
GO
IF EXISTS(SELECT * FROM dbo.EmailValues)
	 EXEC('INSERT INTO dbo.Tmp_EmailValues (TrackingEmailId, [Key], Value)
		SELECT TrackingEmailId, [Key], CONVERT(nvarchar(MAX), Value) FROM dbo.EmailValues WITH (HOLDLOCK TABLOCKX)')
GO
DROP TABLE dbo.EmailValues
GO
EXECUTE sp_rename N'dbo.Tmp_EmailValues', N'EmailValues', 'OBJECT' 
GO
ALTER TABLE dbo.EmailValues ADD CONSTRAINT
	FK_EmailValues_EmailTracking FOREIGN KEY
	(
	TrackingEmailId
	) REFERENCES dbo.EmailTracking
	(
	EmailId
	) ON UPDATE  NO ACTION 
	 ON DELETE  NO ACTION 
	
GO
COMMIT
