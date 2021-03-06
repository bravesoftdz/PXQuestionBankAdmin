SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT * FROM sysobjects WHERE id = object_id(N'[dbo].[GetReminderEmails]') AND OBJECTPROPERTY(id, N'IsProcedure') = 1)
BEGIN
	DROP PROCEDURE [dbo].[GetReminderEmails]
END
GO

CREATE PROCEDURE [dbo].[GetReminderEmails]
	
AS
BEGIN
	SET NOCOUNT ON;
    
	SELECT ISNULL(E.EmailId, 0) AS EmailId, ISNULL(E.CourseId, '') AS CourseId, ISNULL(E.ItemId, '') as ItemId, ISNULL(E.InstructorId, 0) AS 			InstructorId, ISNULL(EV1.[Value], '') AS InstructorSubject, ISNULL(EV2.[Value], '') AS InstructorBody, ISNULL(EV3.[Value], '') AS 		ToList, ISNULL(ET.TemplateText, '') AS TemplateText, ISNULL(ET.TemplateHtml, '') AS TemplateHtml, ISNULL(E.[Status], '') AS Status, ISNULL(E.[NotificationType], 1) AS NotificationType  
	FROM [dbo].[EmailTracking] E
	LEFT OUTER JOIN EmailValues EV1 ON E.emailid = EV1.trackingemailid AND EV1.[Key] = 'SubjectText'
	LEFT OUTER JOIN EmailValues EV2 ON E.emailid = EV2.trackingemailid AND EV2.[Key] = 'BodyText'
	LEFT OUTER JOIN EmailValues EV3 ON E.emailid = EV3.trackingemailid AND EV3.[Key] = 'ToList'
	INNER JOIN [dbo].[EmailTemplateMapping] ETM ON E.ProductId = ETM.ProductId 
	AND E.NotificationType = ETM.EventType
	INNER JOIN [dbo].[EmailTemplate] ET ON ET.Id = ETM.TemplateId
	WHERE E.[Status] in ('add','failed1','failed2') AND SendOnDate <= GETDATE()
	AND LEN(ISNULL(E.CourseId, ''))>0 AND LEN(ISNULL(E.ItemId,''))>0
	ORDER BY E.[Status]

END
