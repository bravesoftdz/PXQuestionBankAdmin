<%

Sub ConnectToBFWUsersDB
  On Error Resume Next
  '-- SQL Server Connection String  --'
	strConnect = "PROVIDER=SQLOLEDB;" & _
				 "SERVER=BFWDATA;DATABASE=bfwusers;" & _
				 "UID=BFWUsers;PWD=(BFW33);"
'				 "UID=rauser;PWD=Welcome1;"
'response.write strConnect
'response.end
'
'	strConnect = "PROVIDER=SQLOLEDB;" & _
'				 "SERVER=bfwdata;DATABASE=BFWUsers;" & _
'				 "UID=BFWUsers;PWD=(BFW33);"
'	strConnect = "PROVIDER=SQLOLEDB;" & _
'				 "DSN=BFWUsers;"

	Set objConn = Server.CreateObject("ADODB.Connection")
	If Err <> 0 Then
''		Application("ApplicationStartdErr1") = Err.Number & ":" & Err.Description
		Err.Clear
	End If

	objConn.Open strConnect
	If Err <> 0 Then
''		Application("ApplicationStartdErr2") = Err.Number & ":" & Err.Description
		Err.Clear
	End If

	Set objRs = Server.CreateObject("ADODB.Connection")
	If Err <> 0 Then
''		Application("ApplicationStartdErr3") = Err.Number & ":" & Err.Description
		Err.Clear
	End If

	objRs.Open  objConn
	If Err <> 0 Then
''		Application("ApplicationStartdErr4") = Err.Number & ":" & Err.Description
		Err.Clear
	End If

''	set Application("OBJ_RA_DB") = objRs

End Sub

' Check for errors '
Sub CheckForErrors (objConn)
  ' Errors means the count will be greater than 0
  If objConn.Errors.Count > 0 Then

    ' loop through the errors
    For Each objError in objConn.Errors
      Response.Write "<TABLE BORDER=1>" & _
          "<TR><TD>Error Property</TD>" & _
             "<TD>Contents</TD></TR>" & _
          "<TR><TD>Number</TD><TD>" & _
              objError.Number & "</TD></TR>" & _
          "<TR><TD>NativeError</TD><TD>" & _
              objError.NativeError & "</TD></TR>" & _
          "<TR><TD>SQLState</TD><TD>" & _
              objError.SQLState & "</TD></TR>" & _
          "<TR><TD>Source</TD><TD>" & _
              objError.Source & "</TD></TR>" & _
          "<TR><TD>Description</TD><TD>" & _
              objError.Description & "</TD></TR>" & _
          "</TABLE><P>"
    Next
  End If
End Sub


%>

