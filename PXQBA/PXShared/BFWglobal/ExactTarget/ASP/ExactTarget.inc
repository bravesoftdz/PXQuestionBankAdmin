<%

' ******************************************************************
' VARIABLE : ET_sOutputStatus
' Used as default value of all functions.  
' Set regardless of whether or calling app uses it to catch output
' of each function
'
dim ET_sOutputStatus : ET_sOutputStatus = "default"



'' ********************************************************************

sub ET_Http_Request (wsF,strEnvelope)
	Dim ET_Http
	Set ET_Http = Server.CreateObject("Microsoft.XMLHTTP")
'	dim wsURL : wsURL = "http://192.168.34.21/bfwwebv2/exacttarget/emailtarget.asmx"
'	dim wsURL : wsURL = "http://192.168.77.242/raws3/exacttarget/emailtarget.asmx"
	dim wsURL : wsURL = "http://raws.bfwpub.com/raws3/exacttarget/emailtarget.asmx"
	ET_Http.Open "post", wsURL, false
	ET_Http.setRequestHeader "Soapaction", "http://tempuri.org/"& wsF
	ET_Http.setRequestHeader "Content-Type", "text/xml; charset=utf-8"
	ET_Http.Send strEnvelope

	if ET_Http.responsetext = "" then
			set ET_Http = nothing
			set ET_XML = nothing
			ET_EndOnError
	else
		ET_XML.loadXML(ET_Http.responsetext)
'ET_debugWrite "x", ET_XML.xml
'ET_debugWrite "x", ET_XML.getElementsByTagName("soap:Fault").length
		if ET_XML.getElementsByTagName("soap:Fault").length > 0 then
			set ET_Http = nothing
			ET_EndOnError
		else
		end if
	end if

	set ET_Http = nothing
end sub




'' ********************************************************************


' ******************************************************************
' FUNCTION : ET_RetrieveUser
' CHECK STATUS OF USER
' return values:
' 	"default" -- a default error
' 	"Active"
' 	"Unsubscribed"
' 	"Subscriber not found"
' 	[status message on failure]
'
function ET_RetrieveUser (EmailAddress)
	ET_sOutputStatus = "default"
	dim ET_Get_Envelope_RetrieveUser : ET_Get_Envelope_RetrieveUser = ""&_
"<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"""&_
" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"""&_
" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">"&_
"  <soap:Body>"&_
"    <RetrieveUser xmlns=""http://tempuri.org/"">"&_
"      <Email__Address>"& EmailAddress &"</Email__Address>"&_
"    </RetrieveUser>"&_
"  </soap:Body>"&_
"</soap:Envelope>"&_
""


	ET_Http_Request "RetrieveUser", ET_Get_Envelope_RetrieveUser



	ET_methodStatus = ""
	ET_methodErrors = ""
	ET_StatusMessage = ""
	ET_SubscriberMessage = ""
	dim ET_resultXML
	set ET_resultXML = ET_XML.selectSingleNode("/soap:Envelope/soap:Body/RetrieveUserResponse/RetrieveUserResult/returnStatus")
ET_debugWrite "x", "ET Response :: "& ET_XML.xml &VBCRLF &VBCRLF &VBCRLF &VBCRLF

	set ET_methodStatus = ET_resultXML.selectSingleNode("./methodStatus")
	if ET_methodStatus.text <> "Success" then
		set ET_methodStatus = nothing

		set ET_methodStatus = ET_resultXML.selectSingleNode("./SubscriberMessage/message")
		if inStr(ET_methodStatus.text,"Subscriber not found") > 0 then
			ET_sOutputStatus = "Subscriber not found"
			set ET_methodStatus = nothing
		else

			set ET_methodErrors = ET_resultXML.selectNodes("./errors/error")
			dim ET_methodErrors_ct : ET_methodErrors_ct = 0
			dim ET_methodErrors_text : ET_methodErrors_text = ""
			dim iNode
			for each iNode in ET_methodErrors
				ET_methodErrors_ct = ET_methodErrors_ct + 1
				ET_methodErrors_text = ET_methodErrors_text&VBCRLF& ET_methodErrors_ct &" :: "& iNode.text
			next
			if ET_methodErrors_ct > 0 then
				set ET_methodErrors = nothing
ET_debugWrite "x", "ET ERROR Failure ("& ET_methodErrors_ct &" errors) :: "& ET_methodErrors_text &VBCRLF
			else
''				set ET_SubscriberMessage = ET_resultXML.selectSingleNode("./SubscriberMessage/message")
''ET_debugWrite "x", "ET Failure :: "& ET_SubscriberMessage.text &VBCRLF
''				set ET_SubscriberMessage = nothing
			end if
		end if
	else
		set ET_methodStatus = nothing
		set ET_StatusMessage = ET_resultXML.selectSingleNode("./Status/message")
		if not(cbool(ET_StatusMessage is nothing)) then
ET_debugWrite "x", "ET User Status :: "& ET_StatusMessage.text &VBCRLF
			ET_sOutputStatus = ET_StatusMessage.text
			set ET_StatusMessage = nothing
		end if
	end if

	ET_RetrieveUser = ET_sOutputStatus
end function




'' *****************************************************************
' ******************************************************************
' FUNCTION : ET_SubscribeUser
' SUBSCRIBE NEW USER
' return values:
' 	"default" -- a default error for uncaught exceptions
' 	"Success"
' 	"Exists"
' 	[status message on known failure]
'
function ET_SubscribeUser (EmailAddress, FName, LName, RADateCreated, RABaseURL)
	ET_sOutputStatus = "default"
	dim ET_Get_Envelope_SubscribeUser : ET_Get_Envelope_SubscribeUser = ""&_
"<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"""&_
" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"""&_
" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">"&_
"  <soap:Body>"&_
"    <SubscribeUser xmlns=""http://tempuri.org/"">"&_
"      <Email__Address>"& EmailAddress &"</Email__Address>"&_
"      <FirstName>"& FName &"</FirstName>"&_
"      <LastName>"& LName &"</LastName>"&_
"      <RADateCreated>"& RADateCreated &"</RADateCreated>"&_
"      <RABaseURL>"& RABaseURL &"</RABaseURL>"&_
"    </SubscribeUser>"&_
"  </soap:Body>"&_
"</soap:Envelope>"&_
""


	ET_Http_Request "SubscribeUser", ET_Get_Envelope_SubscribeUser



	ET_methodStatus = ""
	ET_methodErrors = ""
	ET_StatusMessage = ""
	ET_SubscriberMessage = ""
	dim ET_resultXML, ET_errorXML
	set ET_errorXML = ET_XML.selectSingleNode("/soap:Envelope/soap:Body/soap:Fault")
	if not(cbool(ET_errorXML is nothing)) then
ET_debugWrite "x", "ET SOAP FAULT :: "& ET_errorXML.xml &VBCRLF &VBCRLF &VBCRLF &VBCRLF
		ET_EndOnError
	else
		set ET_resultXML = ET_XML.selectSingleNode("/soap:Envelope/soap:Body/SubscribeUserResponse/SubscribeUserResult/returnStatus")
		if cbool(ET_resultXML is nothing) then
ET_debugWrite "x", "ET ERROR :: returnStatus not found"&VBCRLF &VBCRLF &VBCRLF &VBCRLF
ET_debugWrite "x", "ET_XML :: "& ET_XML.xml &VBCRLF &VBCRLF &VBCRLF &VBCRLF
			ET_EndOnError
		else
ET_debugWrite "x", "ET Response :: "& ET_resultXML.xml &VBCRLF &VBCRLF &VBCRLF &VBCRLF

			set ET_methodStatus = ET_resultXML.selectSingleNode("./methodStatus")
			if not(cbool(ET_methodStatus is nothing)) then
				if ET_methodStatus.text <> "Success" then
					set ET_methodStatus = nothing

					set ET_methodStatus = ET_resultXML.selectSingleNode("./SubscriberMessage/message")
					if ET_methodStatus.text = "The subscriber already exists in the list" then
						ET_sOutputStatus = "Exists"
						set ET_methodStatus = nothing
					else
						set ET_methodStatus = nothing
						set ET_methodErrors = ET_resultXML.selectNodes("./errors/error")
						dim ET_methodErrors_ct : ET_methodErrors_ct = 0
						dim ET_methodErrors_text : ET_methodErrors_text = ""
						dim iNode
						for each iNode in ET_methodErrors
							ET_methodErrors_ct = ET_methodErrors_ct + 1
							ET_methodErrors_text = ET_methodErrors_text&VBCRLF& ET_methodErrors_ct &" :: "& iNode.text
						next
						if ET_methodErrors_ct > 0 then
							set ET_methodErrors = nothing
ET_debugWrite "x", "ET ERROR Failure ("& ET_methodErrors_ct &" errors) :: "& ET_methodErrors_text &VBCRLF
						else
				''			set ET_SubscriberMessage = ET_resultXML.selectSingleNode("./SubscriberMessage/message")
				''ET_debugWrite "x", "ET Failure :: "& ET_SubscriberMessage.text &VBCRLF
				''			set ET_SubscriberMessage = nothing
						end if
					end if
				else
					ET_sOutputStatus = ET_methodStatus.text
		ET_debugWrite "x", "ET User Status :: "& ET_sOutputStatus &VBCRLF
				end if
			else
				set ET_methodStatus = nothing
				set ET_StatusMessage = ET_resultXML.selectSingleNode("./Status/message")
				if not(cbool(ET_StatusMessage is nothing)) then
		ET_debugWrite "x", "ET User Status :: "& ET_StatusMessage.text &VBCRLF
					ET_sOutputStatus = ET_StatusMessage.text
					set ET_StatusMessage = nothing
				else
		ET_debugWrite "x", "ET User Status :: Status/message NOT FOUND"&VBCRLF
					ET_sOutputStatus = "ERROR :: "& ET_resultXML.xml
				end if
			end if
		end if
	end if

	ET_SubscribeUser = ET_sOutputStatus
end function




'' *****************************************************************
' ******************************************************************
' FUNCTION : ET_UpdateUser
' UPDATE USER
' return values:
' 	"default" -- a default error for uncaught exceptions
' 	"Subscribe"
' 	"Unsubscribe"
' 	"Subscriber not found"
' 	[status message on known failure]
'
function ET_UpdateUser (EmailAddress, FName, LName, Status)
	ET_sOutputStatus = "default"
	dim ET_Get_Envelope_UpdateUser : ET_Get_Envelope_UpdateUser = ""&_
"<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"""&_
" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"""&_
" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">"&_
"  <soap:Body>"&_
"   <UpdateUser xmlns=""http://tempuri.org/"">"&_
"      <Email__Address>"& EmailAddress &"</Email__Address>"&_
"      <FirstName>"& FName &"</FirstName>"&_
"      <LastName>"& LName &"</LastName>"&_
"      <Status>"& Status &"</Status>"&_
"    </UpdateUser>"&_
"  </soap:Body>"&_
"</soap:Envelope>"&_
""


	ET_Http_Request "UpdateUser", ET_Get_Envelope_UpdateUser



	ET_methodStatus = ""
	ET_methodErrors = ""
	ET_StatusMessage = ""
	ET_SubscriberMessage = ""
	dim ET_resultXML, ET_errorXML
	set ET_errorXML = ET_XML.selectSingleNode("/soap:Envelope/soap:Body/soap:Fault")
	if not(cbool(ET_errorXML is nothing)) then
ET_debugWrite "x", "ET SOAP FAULT :: "& ET_errorXML.xml &VBCRLF &VBCRLF &VBCRLF &VBCRLF
		ET_EndOnError
	else
		set ET_resultXML = ET_XML.selectSingleNode("/soap:Envelope/soap:Body/UpdateUserResponse/UpdateUserResult/returnStatus")
		if cbool(ET_resultXML is nothing) then
ET_debugWrite "x", "ET ERROR :: returnStatus not found"&VBCRLF &VBCRLF &VBCRLF &VBCRLF
ET_debugWrite "x", "ET_XML :: "& ET_XML.xml &VBCRLF &VBCRLF &VBCRLF &VBCRLF
			ET_EndOnError
		else
ET_debugWrite "x", "ET Response :: "& ET_resultXML.xml &VBCRLF &VBCRLF &VBCRLF &VBCRLF

			set ET_methodStatus = ET_resultXML.selectSingleNode("./methodStatus")
			if ET_methodStatus.text <> "Success" then
				set ET_methodStatus = nothing

				set ET_methodStatus = ET_resultXML.selectSingleNode("./SubscriberMessage/message")
				if inStr(ET_methodStatus.text,"Subscriber not found") > 0 then
					ET_sOutputStatus = "Subscriber not found"
					set ET_methodStatus = nothing
				else
					set ET_methodStatus = nothing
					set ET_methodErrors = ET_resultXML.selectNodes("./errors/error")
					dim ET_methodErrors_ct : ET_methodErrors_ct = 0
					dim ET_methodErrors_text : ET_methodErrors_text = ""
					dim iNode
					for each iNode in ET_methodErrors
						ET_methodErrors_ct = ET_methodErrors_ct + 1
						ET_methodErrors_text = ET_methodErrors_text&VBCRLF& ET_methodErrors_ct &" :: "& iNode.text
					next
					if ET_methodErrors_ct > 0 then
						set ET_methodErrors = nothing
ET_debugWrite "x", "ET ERROR Failure ("& ET_methodErrors_ct &" errors) :: "& ET_methodErrors_text &VBCRLF
					else
			''			set ET_SubscriberMessage = ET_resultXML.selectSingleNode("./SubscriberMessage/message")
			''ET_debugWrite "x", "ET Failure :: "& ET_SubscriberMessage.text &VBCRLF
			''			set ET_SubscriberMessage = nothing
					end if
				end if
			else
				set ET_methodStatus = nothing
				set ET_StatusMessage = ET_resultXML.selectSingleNode("./parameters/Status")
ET_debugWrite "x", "ET User Status :: "& ET_StatusMessage.text &VBCRLF
				ET_sOutputStatus = ET_StatusMessage.text
				set ET_StatusMessage = nothing
			end if
		end if
	end if

	ET_UpdateUser = ET_sOutputStatus
end function




'' ********************************************************************
' ******************************************************************
' FUNCTION : ET_GetUTCDate
' Change a valid ASP/VBScript datetime string into a UTC datetime string 
'
function ET_GetUTCDate ( ET_dtStr )
	dim ET_dt : ET_dt = CDate(ET_dtStr)
	dim ET_dty : ET_dty = Year(ET_dt)
	dim ET_dtm : ET_dtm = Month(ET_dt)
	if len(ET_dtm)=1 then
		ET_dtm = "0"& ET_dtm
	end if
	dim ET_dtd : ET_dtd = Day(ET_dt)
	if len(ET_dtd)=1 then
		ET_dtd = "0"& ET_dtd
	end if
	dim ET_dth : ET_dth = Hour(ET_dt)
	if len(ET_dth)=1 then
		ET_dth = "0"& ET_dth
	end if
	dim ET_dtmin : ET_dtmin = Minute(ET_dt)
	if len(ET_dtmin)=1 then
		ET_dtmin = "0"& ET_dtmin
	end if
	dim ET_dts : ET_dts = Second(ET_dt)
	if len(ET_dts)=1 then
		ET_dts = "0"& ET_dts
	end if
	ET_GetUTCDate = ET_dty&"-"&ET_dtm&"-"&ET_dtd&"T"&ET_dth&":"&ET_dtmin&":"&ET_dts
end function





' *********************************************************************************
' *********************************************************************************
' *********************************************************************************




dim ET_XML
set ET_XML = Server.CreateObject("Microsoft.XMLDOM")




sub ET_EndOnError ()


end sub




' *********************************************************************************


sub ET_debugWrite (vs, msg)
	if false or Request.Querystring("ETdebug") = "true" then
		response.write msg
		response.write "<br/>"
	end if
end sub

%>

