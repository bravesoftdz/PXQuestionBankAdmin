<%

Response.buffer = true
'Response.contenttype = "text/html"
'Response.contenttype = "text/plain"
Response.contenttype = "text/xml"

dim wsID : wsID = Request.QueryString("wsID")
dim wsF : wsF = Request.QueryString("wsF")

dim RARootDomain
if inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.114") > 0 then
	RARootDomain = "192.168.77.242"
''	RARootDomain = "bcs.bfwpub.com"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.243") > 0 then
	RARootDomain = "192.168.77.242"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.244") > 0 then
	RARootDomain = "192.168.77.242"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.245") > 0 then
	RARootDomain = "192.168.77.242"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.242") > 0 then
	RARootDomain = "192.168.77.242"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"localhost") > 0 then
	RARootDomain = "int-raws.bfwpub.com"
''	RARootDomain = "bcs.bfwpub.com"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"dev-gradebook.bfwpub.com") > 0 then
	RARootDomain = "192.168.77.242"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"dev-scorecard.bfwpub.com") > 0 then
	RARootDomain = "192.168.77.242"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"stg-gradebook.bfwpub.com") > 0 then
	RARootDomain = "192.168.77.242"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"stg-scorecard.bfwpub.com") > 0 then
	RARootDomain = "192.168.77.242"
elseif inStr(Request.ServerVariables("HTTP_HOST"),"int-") = 1 then
	RARootDomain = "int-bcs.bfwpub.com"
	if wsID = "RAWS3" then
		RARootDomain = "int-raws.bfwpub.com"
	elseif wsID = "IL_CheckInstructorAccess" then
		RARootDomain = "int-raws.bfwpub.com"
	end if
elseif inStr(Request.ServerVariables("HTTP_HOST"),"stg-") = 1 then
	RARootDomain = "stg-bcs.bfwpub.com"
	if wsID = "RAWS3" then
		RARootDomain = "stg-raws.bfwpub.com"
	elseif wsID = "IL_CheckInstructorAccess" then
		RARootDomain = "stg-raws.bfwpub.com"
	end if
else
	RARootDomain = "bcs.bfwpub.com"
	if wsID = "RAWS3" then
		RARootDomain = "raws.bfwpub.com"
'		RARootDomain = "192.168.204.201"
	elseif wsID = "IL_CheckInstructorAccess" then
		RARootDomain = "raws.bfwpub.com"
'		RARootDomain = "192.168.204.201"
	end if
end if

dim RequestBinCt
dim RequestBin
dim RequestBinStr : RequestBinStr = ""

RequestBinCt=Request.TotalBytes
RequestBin=Request.BinaryRead(RequestBinCt)

dim i, str
str = ""
For i = 1 To Request.TotalBytes
'	j = (i - 1) Mod 16
	c = MidB(RequestBin,i,1)
	if AscB(c) < 32 Or AscB(c) > 255 Then str = str Else str = str & Chr(AscB(c))

'	If j >= 15 Then
		RequestBinStr = RequestBinStr & str
		str = ""
'	End If
Next

	Dim xml
	Set xml = Server.CreateObject("Microsoft.XMLHTTP")
	dim wsURL
	Dim strEnvelope

	strEnvelope = RequestBinStr

	select case wsID
		case "IL_CheckInstructorAccess"
			wsURL = "http://"& RARootDomain &"/ILoginWS/InstructorAccess.asmx"
if Request.QueryString("debug") = "IL_CheckInstructorAccess" then
strEnvelope = ""&_
"<?xml version=""1.0"" encoding=""UTF-8""?>"&_
"<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">  <soap:Body>    <CheckInstructorAccess xmlns=""http://tempuri.org/webservices/"">      <uid>118</uid>      <ISBN>1429235101</ISBN>    </CheckInstructorAccess>  </soap:Body></soap:Envelope>"
end if
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "http://tempuri.org/webservices/CheckInstructorAccess"
			xml.setRequestHeader "Content-Type", "text/xml; charset=utf-8"
		case "RAXS_WS"
if Request.QueryString("debug") = "RAXS_WS" then
strEnvelope = ""&_
"<soap:Envelope xmlns:xsi=""http://tempuri.org/"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">  <soap:Body>    <RAXS_WS xmlns=""http://tempuri.org/"">      <iUserID>156</iUserID>    </RAXS_WS>  </soap:Body></soap:Envelope>"
end if
			wsURL = "http://"& RARootDomain &"/RA/RAXS/WS/v1.1/RAXS_WS.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "RAWS1"
if Request.QueryString("debug") = "UserAuthentication" then
response.write strEnvelope
response.end
			wsURL = "http://bcs.bfwpub.com/RA_WS_HCL/service1.asmx?wsdl"
strEnvelope = ""&_
"<soap:Envelope xmlns:soap=""http://www.w3.org/2003/05/soap-envelope"""&_
"    xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"""&_
"    xmlns:xsd=""http://www.w3.org/2001/XMLSchema"">"&_
"    <soap:Body>"&_
"        <UserAuthenticationResponse xmlns=""RAUserAuthentication"">"&_
"            <UserAuthenticationResult>2085990</UserAuthenticationResult>"&_
"            <sErrorMessage/>"&_
"        </UserAuthenticationResponse>"&_
"    </soap:Body>"&_
"</soap:Envelope>"&_
""
end if
if Request.QueryString("debug") = "SiteLogin" then
strEnvelope = ""&_
"<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">"&_
"<soap:Body>"&_
"<SiteLogin xmlns=""http://tempuri.org/"">"&_
"<iUserID></iUserID>"&_
"<iSiteID>24527</iSiteID>"&_
"<sIPAddr>192.168.80.208</sIPAddr>"&_
"</SiteLogin>"&_
"</soap:Body>"&_
"</soap:Envelope>"&_
""
end if
			wsURL = "http://"& RARootDomain &"/ra_webservices/webservice1/service1.asmx?wsdl"
'			wsURL = "http://raws.bfwpub.com/raws1/service1.asmx"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "http://tempuri.org/"& replace(wsF,"1_","")
			xml.setRequestHeader "Content-Type", "text/xml"
		case "RAWS1HCL"
			wsURL = "http://"& RARootDomain &"/RA_WS_HCL/service1.asmx?wsdl"
'			wsURL = "http://"& RARootDomain &"/ra_webservices_2/"& wsF &"/RA"& wsF &".asmx"
if Request.QueryString("debug") = "EmailLogins" then
			wsURL = "http://bcs.bfwpub.com/RA_WS_HCL/service1.asmx?wsdl"
strEnvelope = ""&_
"<?xml version=""1.0"" encoding=""UTF-8""?>"&_
"<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">  <soap:Body>"&_
"<EmailLogins xmlns=""http://tempuri.org/"">"&_
"<sUserEmail>ccrume@bfwpub.com</sUserEmail>"&_
"</EmailLogins>  </soap:Body></soap:Envelope>"&_
""
end if
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "http://tempuri.org/"& wsF
			xml.setRequestHeader "Content-Type", "text/xml; charset=utf-8"
		case "RAWS2"
			wsF = replace(wsF,"2_","")
			wsURL = "http://"& RARootDomain &"/raws2/"& wsF &"/RA"& wsF &".asmx"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "http://tempuri.org/"& wsF
			xml.setRequestHeader "Content-Type", "text/xml; charset=utf-8"
'			xml.setRequestHeader "Content-Type", "application/soap+xml; charset=utf-8"
		case "RAWS3"
			wsF = replace(wsF,"3_","")
			if wsF = "CheckDefaultClass" or wsF = "GetDefaultClass" then
				wsURL = "http://"& RARootDomain &"/raws3/"& wsF &"/"& wsF &".asmx"
			else
				wsURL = "http://"& RARootDomain &"/raws3/"& wsF &"/RA"& wsF &".asmx"
			end if
			xml.Open "post", wsURL, false
			if wsF = "CheckDefaultClass" or wsF = "GetDefaultClass" then
				xml.setRequestHeader "Soapaction", "http://bfwpub.com/CheckClass"
			else
				xml.setRequestHeader "Soapaction", "RA"& wsF &"/"& wsF
			end if
			xml.setRequestHeader "Content-Type", "text/xml; charset=utf-8"
if Request.QueryString("debug") = "RAWS3" then
'strEnvelope = ""&_
'"<soap:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">  <soap:Body>    <StudentRegistration xmlns=""RAStudentRegistration"">      <sUserName>yoda@s.e</sUserName>      <sInstructorEmail></sInstructorEmail>      <sUserFirstName>Chad</sUserFirstName>      <sUserLastName>Test</sUserLastName>      <sUserPwd>1237</sUserPwd>      <sVerifyPwd>1237</sVerifyPwd>      <sUserPwdHint>1 2 37</sUserPwdHint>      <sRemoteIPAddr>chad faking</sRemoteIPAddr>      <sBaseURL>192.168.77.245/myers9eap</sBaseURL>      <sOptInEmail>undefined</sOptInEmail>    </StudentRegistration>  </soap:Body></soap:Envelope>"
'response.write wsURL
'response.end
end if
		case "RAWS3_GetPackages"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/GetPackages.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "RAWS3_CheckActivationCode_packages"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/CheckActivationCode_packages.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "RAWS3_CheckActivationCode"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/CheckActivationCode.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "RAWS3_AssignUserCodes"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/AssignUserCodes.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "RAWS3_JoinClass"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/JoinClass.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "RAWS3_GetSiteFromBaseURL"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/GetSiteFromBaseURL.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
if Request.QueryString("debug") = "RAWS3_GetSiteFromBaseURL" then
strEnvelope = ""&_
"<?xml version=""1.0"" encoding=""UTF-8""?>"&_
"<soap:Envelope xmlns:xsi=""http://tempuri.org/"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">  <soap:Body>    <GetSiteFromBaseURL xmlns=""http://tempuri.org/"">      <sBaseURL>stg-bcs.worthpublishers.com/myers9e</sBaseURL>    </GetSiteFromBaseURL>  </soap:Body></soap:Envelope>"
end if
		case "RAWS3_GetSiteFromBaseURL_WithProducts"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/GetSiteFromBaseURL_WithProducts.asp"
if Request.QueryString("debug") = "RAWS3_GetSiteFromBaseURL_WithProducts" Then
strEnvelope = ""&_
"<?xml version=""1.0"" encoding=""UTF-8""?>"&_
"<soap:Envelope xmlns:xsi=""http://tempuri.org/"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:soap=""http://schemas.xmlsoap.org/soap/envelope/"">  <soap:Body>    <GetSiteFromBaseURL xmlns=""http://tempuri.org/"">      <sBaseURL>stg-bcs.bedfordstmartins.com/everydaywriter4e</sBaseURL>    </GetSiteFromBaseURL>  </soap:Body></soap:Envelope>"
end if
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "RAWS3JSON_GetSiteFromBaseURL"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/GetSiteFromBaseURLJSON.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
''			xml.setRequestHeader "Content-Type", "text/plain"
		case "RAWS3_GetSitesFromSiteIDs"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/GetSitesFromSiteIDs.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "RAWS3_GetOnyxSchoolsByZip"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/GetOnyxSchoolsByZip.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "XSSession"
			wsURL = "http://"& RARootDomain &"/RA/RAWS3ASP/RAXSSession.asp"
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
		case "querypubcontent"

			if 0 then
				strEnvelope = qpc_test_req()
			end if
			if inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.114") > 0 then
				wsURL = "http://192.168.77.114:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://192.168.77.222:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://dctmws.bfwpub.com:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://qpc.bfwpub.com:8080/querypubcontent/services/QueryPubContent?wsdl"
			elseif inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.243") > 0 then
				wsURL = "http://192.168.77.242:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://192.168.77.114:8080/querypubcontent/services/QueryPubContent?wsdl"
			elseif inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.244") > 0 then
				wsURL = "http://192.168.77.242:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://192.168.77.114:8080/querypubcontent/services/QueryPubContent?wsdl"
			elseif inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.245") > 0 then
				wsURL = "http://192.168.77.242:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://192.168.77.114:8080/querypubcontent/services/QueryPubContent?wsdl"
			elseif inStr(Request.ServerVariables("HTTP_HOST"),"192.168.77.242") > 0 then
				wsURL = "http://192.168.77.242:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://192.168.77.114:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://dctmws.bfwpub.com:8080/querypubcontent/services/QueryPubContent?wsdl"
			elseif inStr(Request.ServerVariables("HTTP_HOST"),"dev-") = 1 then
				wsURL = "http://stg-qpc.bfwpub.com:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://192.168.77.222:8080/querypubcontent/services/QueryPubContent?wsdl"
			elseif inStr(Request.ServerVariables("HTTP_HOST"),"int-") = 1 then
				wsURL = "http://int-qpc.bfwpub.com:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://192.168.77.222:8080/querypubcontent/services/QueryPubContent?wsdl"
			elseif inStr(Request.ServerVariables("HTTP_HOST"),"stg-") = 1 then
				wsURL = "http://stg-qpc.bfwpub.com:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://192.168.77.222:8080/querypubcontent/services/QueryPubContent?wsdl"
			else
''				wsURL = "http://192.168.77.114:8080/querypubcontent/services/QueryPubContent?wsdl"
''				wsURL = "http://192.168.77.222:8080/querypubcontent/services/QueryPubContent?wsdl"
				wsURL = "http://qpc.bfwpub.com:8080/querypubcontent/services/QueryPubContent?wsdl"
			end if
			if Request.QueryString("debug") = "stg" then
response.write wsURL
response.end
			end if
			xml.Open "post", wsURL, false
			xml.setRequestHeader "Soapaction", "text/xml"
''			xml.setRequestHeader "Soapaction", " "
''			xml.setRequestHeader "Content-Type", "text/xml"
	end select

if Request.QueryString("debug") = "yes" then
response.write strEnvelope
response.write "<hr/>"
response.write wsURL
response.end
end if

	xml.Send strEnvelope

dim resp
resp = xml.responsetext
'resp = replace(resp,"xml version=""1.0"" encoding=""UTF-8""","xml version=""1.0"" ")
'resp = replace(resp,"><",">"&VBCRLF&"<")

resp = replace(resp,"�","&#x2019;")
resp = replace(resp,"&apos;","&#x0027;")
'resp = replace(resp,"&","")

resp = replace(resp,"[[IP HERE]]", Request.ServerVariables("REMOTE_ADDR") )

'resp = replace(resp,"?xml version=""1.0"" ?","test/")
	Response.Write resp
'	Response.Write xml.responsetext


RequestBin = ""

function qpc_test_req ()
	if 1 then
		qpc_test_req = ""&_
	"<?xml version=""1.0"" encoding=""utf-8""?>" &_
	"<SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/"">" &_
	"  <SOAP-ENV:Body>" &_
	"     <ResourceLibrary> " &_
	"		<Query>" &_
	"			<Select>" &_
	"				<at n=""bsi_sequence"" />" &_
	"				<at n=""bsi_item_id"" />" &_
	"				<at n=""bsi_parent_id"" />" &_
	"				<at n=""bsi_relation"" />" &_
	"				<at n=""bsi_bfw_uid"" />" &_
	"				<at n=""bsi_site_id"" />" &_
	"				<at n=""bsi_item_type"" />" &_
	"				<at n=""bsi_item_subtype"" />"&_
	"				<at n=""bsi_link_url"" />" &_
	"				<at n=""bsi_title"" />" &_
	"				<at n=""bsi_access_level"" />"&_
	"			</Select>" &_
	"			<Where>"&_
	"				<paren>"&_
	"					<atx n=""bsi_site_id"">"&_
	"						<eq>1</eq>"&_
	"					</atx>"&_
	"				</paren>"&_
	"			</Where>"&_
	"			<Sort>"&_
	"				<ats n=""bsi_parent_id"" order=""ASC"" />"&_
	"				<ats n=""bsi_sequence"" order=""ASC"" />"&_
	"			</Sort>"&_
	"		</Query>" &_
	"	</ResourceLibrary>" &_
	"  </SOAP-ENV:Body>" &_
	"</SOAP-ENV:Envelope>" &_
	""
	elseif 1 then
		qpc_test_req = ""&_
"<?xml version=""1.0"" encoding=""utf-8""?><SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/"">  <SOAP-ENV:Body>     "&_
"<ResourceLibrary> 		<Query>"&_
"			<Select>               <at n=""bsi_sequence"" />"&_
"				<at n=""bsi_item_id"" />"&_
"				<at n=""bsi_parent_id"" />               <at n=""bsi_relation"" />"&_
"				<at n=""bsi_bfw_uid"" />"&_
"				<at n=""bsi_site_id"" />"&_
"				<at n=""bsi_item_type"" />"&_
"				<at n=""bsi_item_subtype"" />"&_
"				<at n=""bsi_link_url"" />"&_
"				<at n=""bsi_title"" />"&_
"				<at n=""bsi_access_level"" />"&_
"			</Select>"&_
"			<Where>"&_
"				<paren>                   <atx n=""bsi_site_id"">"&_
"						<eq>1</eq>"&_
"					</atx>                   <atx n=""bsi_parent_id"">"&_
"						<eq>bsi-toc-122208903175824</eq>"&_
"					</atx>                   <atx n=""bsi_relation"">"&_
"						<eq>1</eq>"&_
"					</atx>"&_
"				</paren>"&_
"			</Where>"&_
"			<Sort>"&_
"				<ats n=""bsi_sequence"" order=""ASC"" />"&_
"			</Sort>"&_
"		</Query>"&_
"	</ResourceLibrary>  </SOAP-ENV:Body></SOAP-ENV:Envelope>"
	elseif 1 then
		qpc_test_req = ""&_
		"<?xml version=""1.0"" encoding=""utf-8""?>" &_
		"<SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/"">" &_
		"  <SOAP-ENV:Body>" &_
		"     <ResourceLibrary> " &_
		"		<Query>" &_
		"			<Select>" &_
		"               <at n=""content_URL"" />" &_
		"               <at n=""r_object_type"" />" &_
		"			</Select>" &_
		"			<Where>"&_
		"				<paren>"&_
		"                   <atx n=""bfw_uid"">"&_
		"						<eq>c0a84dda:11b50a111b01698438-7e5d</eq>"&_
		"					</atx>"&_
		"				</paren>"&_
		"			</Where>"&_
		"		</Query>" &_
		"	</ResourceLibrary>" &_
		"  </SOAP-ENV:Body>" &_
		"</SOAP-ENV:Envelope>"
	elseif 1 then
		qpc_test_req = ""&_
		"<?xml version=""1.0"" encoding=""utf-8""?>" &_
		"<SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/"">" &_
		"  <SOAP-ENV:Body>" &_
		"     <ResourceLibrary> " &_
		"		<Query>" &_
		"			<Select>" &_
		"               <at n=""bsi_sequence"" />" &_
		"				<at n=""bsi_item_id"" />" &_
		"				<at n=""bsi_parent_id"" />" &_
		"               <at n=""bsi_relation"" />" &_
		"				<at n=""bsi_bfw_uid"" />" &_
		"				<at n=""bsi_site_id"" />" &_
		"				<at n=""bsi_item_type"" />" &_
		"				<at n=""bsi_item_subtype"" />" &_
		"				<at n=""bsi_link_url"" />" &_
		"				<at n=""bsi_title"" />" &_
		"				<at n=""bsi_access_level"" />" &_
		"			</Select>" &_
		"			<Where>" &_
		"				<paren>" &_
		"                   <atx n=""bsi_site_id"">" &_
		"						<eq>1</eq>" &_
		"					</atx>" &_
		"                   <atx n=""bsi_parent_id"">" &_
		"						<eq>chad 1</eq>" &_
		"					</atx>" &_
		"                   <atx n=""bsi_relation"">" &_
		"						<eq>1</eq>" &_
		"					</atx>" &_
		"				</paren>" &_
		"			</Where>" &_
		"			<Sort>" &_
		"				<ats n=""bsi_sequence"" order=""ASC"" />" &_
		"			</Sort>" &_
		"		</Query>" &_
		"	</ResourceLibrary>" &_
		"  </SOAP-ENV:Body>" &_
		"</SOAP-ENV:Envelope>"
	elseif 0 then
		qpc_test_req = ""&_
		"<?xml version=""1.0"" encoding=""utf-8""?>" &_
		"<SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/"">" &_
		"  <SOAP-ENV:Body>" &_
		"     <ResourceLibrary> " &_
		"		<Query>" &_
		"			<Select>" &_
		"				<at n=""bsi_title"" />" &_
		"				<at n=""bsi_link_url"" />" &_
		"			</Select>" &_
		"			<Where>"&_
		"				<paren>"&_
		"                   <atx n=""bsi_bfw_uid"">"&_
		"						<eq>c0a84dda:11b50a111b01698438-7e5d</eq>"&_
		"					</atx>"&_
		"				</paren>"&_
		"			</Where>"&_
		"		</Query>" &_
		"	</ResourceLibrary>" &_
		"  </SOAP-ENV:Body>" &_
		"</SOAP-ENV:Envelope>"
	elseif 1 then
		qpc_test_req = ""&_
		"<?xml version=""1.0"" encoding=""utf-8""?>" &_
		"<SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/"">" &_
		"  <SOAP-ENV:Body>" &_
		"     <ResourceLibrary> " &_
		"		<Query>" &_
		"			<Select>" &_
		"               <at n=""content_URL"" />" &_
		"			</Select>" &_
		"			<Where>"&_
		"				<paren>"&_
		"                   <atx n=""bfw_uid"">"&_
		"						<eq>c0a84dda:11b50a111b01698438-7e5d</eq>"&_
		"					</atx>"&_
		"				</paren>"&_
		"			</Where>"&_
		"		</Query>" &_
		"	</ResourceLibrary>" &_
		"  </SOAP-ENV:Body>" &_
		"</SOAP-ENV:Envelope>"
	elseif 1 then
		qpc_test_req = ""&_
		"<?xml version=""1.0"" encoding=""utf-8""?>" &_
		"<SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/"">" &_
		"  <SOAP-ENV:Body>" &_
		"     <ResourceLibrary> " &_
		"		<Query>" &_
		"			<Select>" &_
		"               <at n=""bfw_resource_name"" />" &_
		"				<at n=""bfw_uid"" />" &_
		"			</Select>" &_
		"			<Where>"&_
		"				<paren>"&_
		"                   <atx n=""bfw_discipline"">"&_
		"						<eq>English</eq>"&_
		"					</atx>"&_
		"				</paren>"&_
		"			</Where>"&_
		"			<Sort>"&_
		"				<ats n=""bsi_resource_name"" order=""ASC"" />"&_
		"			</Sort>"&_
		"		</Query>" &_
		"	</ResourceLibrary>" &_
		"  </SOAP-ENV:Body>" &_
		"</SOAP-ENV:Envelope>"
	elseif 1 then
		qpc_test_req = ""&_
		"<?xml version=""1.0"" encoding=""utf-8""?>" &_
		"<SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/"">" &_
		"  <SOAP-ENV:Body>" &_
		"     <ResourceLibrary> " &_
		"		<Query>" &_
		"			<Select>" &_
		"               <at n=""bsi_sequence"" />" &_
		"				<at n=""bsi_item_id"" />" &_
		"				<at n=""bsi_parent_id"" />" &_
		"               <at n=""bsi_relation"" />" &_
		"				<at n=""bsi_bfw_uid"" />" &_
		"				<at n=""bsi_site_id"" />" &_
		"				<at n=""bsi_item_type"" />" &_
		"				<at n=""bsi_item_subtype"" />"&_
		"				<at n=""bsi_link_url"" />" &_
		"				<at n=""bsi_title"" />" &_
		"				<at n=""bsi_access_level"" />"&_
		"			</Select>" &_
		"			<Where>"&_
		"				<paren>"&_
		"                   <atx n=""bsi_discipline"">"&_
		"						<eq>bsi-toc-122208904480563</eq>"&_
		"					</atx>"&_
		"				</paren>"&_
		"			</Where>"&_
		"			<Sort>"&_
		"				<ats n=""bsi_sequence"" order=""ASC"" />"&_
		"			</Sort>"&_
		"		</Query>" &_
		"	</ResourceLibrary>" &_
		"  </SOAP-ENV:Body>" &_
		"</SOAP-ENV:Envelope>"
	else
		qpc_test_req = ""&_
		"<?xml version=""1.0"" encoding=""utf-8""?>" &_
		"<SOAP-ENV:Envelope xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:SOAP-ENV=""http://schemas.xmlsoap.org/soap/envelope/"">" &_
		"  <SOAP-ENV:Body>" &_
		"     <ResourceLibrary> " &_
		"		<Query>" &_
		"			<Select>" &_
		"               <at n=""bsi_sequence"" />" &_
		"				<at n=""bsi_item_id"" />" &_
		"				<at n=""bsi_parent_id"" />" &_
		"               <at n=""bsi_relation"" />" &_
		"				<at n=""bsi_bfw_uid"" />" &_
		"				<at n=""bsi_site_id"" />" &_
		"				<at n=""bsi_item_type"" />" &_
		"				<at n=""bsi_item_subtype"" />"&_
		"				<at n=""bsi_link_url"" />" &_
		"				<at n=""bsi_title"" />" &_
		"				<at n=""bsi_access_level"" />"&_
		"			</Select>" &_
		"			<Where>"&_
		"				<paren>"&_
		"                   <atx n=""bsi_site_id"">"&_
		"						<eq>1</eq>"&_
		"					</atx>"&_
		"                   <atx n=""bsi_item_type"">"&_
		"						<eq>bfw_toc_document</eq>"&_
		"					</atx>"&_
		"                   <atx n=""bsi_item_subtype"">"&_
		"						<eq>root</eq>"&_
		"					</atx>"&_
		"				</paren>"&_
		"			</Where>"&_
		"			<Sort>"&_
		"				<ats n=""bsi_sequence"" order=""ASC"" />"&_
		"			</Sort>"&_
		"		</Query>" &_
		"	</ResourceLibrary>" &_
		"  </SOAP-ENV:Body>" &_
		"</SOAP-ENV:Envelope>"
	end if
end function
%>


