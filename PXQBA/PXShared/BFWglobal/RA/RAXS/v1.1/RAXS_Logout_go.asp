<%
Response.Buffer = True
Response.contenttype = "text/html"

%>
<!--#include virtual="/RA/RAXS/v1/RAXS_server.asp"-->
<%

'response.write "er?"
'response.end

dim UseClassesSP : UseClassesSP = true
dim UseProfileSP : UseProfileSP = true

dim RADB_GetSiteLogins_THRESHOLD : RADB_GetSiteLogins_THRESHOLD = 1

dim returl : returl = Request.Querystring("returl")
dim lr : lr = Request.Querystring("lr")

dim VERSION
''VERSION = "aspgo"
''VERSION = "jsgo"
''VERSION = "linkgo"
''VERSION = "ifgo"
VERSION = "lronlygo"
%>
<html>
<head>
<style>
body {
	font-family: Arial, sans-serif;
}
</style>
<script type="text/javascript">
var VERSION = '<%=VERSION%>';
function init () {
	if (!navigator.cookieEnabled) {
		document.getElementById('msg').innerHTML = '<p>Cookies must be enabled.</p>';
	} else {
		setTimeout('start()',500);
	}
}
function start () {
	if (VERSION=='lronlygo') {
		go();
	} else if (VERSION=='ifgo') {
		document.getElementById('goif').src = 'RAXS_Logout.asp?lr=<%=lr%>&returl=<%=Server.URLEncode( "192.168.77.242/RA/RAXS/v1.1/RAXS_if_done.asp" )%>';
	} else if (VERSION=='linkgo') {
		document.getElementById('msg').innerHTML = '<a href="JavaScript:go();">continue</a>';
	} else if (VERSION=='jsgo') {
		go();
	}
}
function go () {
//alert('go');
	if (VERSION=='lronlygo') {
		window.location = '<%=RALoginRefURL%>?m=o&returl=<%=Server.URLEncode(returl)%>';
	} else if (VERSION=='jsgo' || VERSION=='ifgo' || VERSION=='linkgo') {
		window.location = 'RAXS_Logout.asp?lr=<%=lr%>&returl=<%=Server.URLEncode(returl)%>';
	} else if (VERSION=='if') {
//	document.getElementById('msg').innerHTML = '<a href="JavaScript:go();">continue</a>';
	}
}
</script>
</head>
<body onload="init()">
<div id="msg">logging you out...</div>
<div style="display:block;padding-top:10px;font-size:10px;color:#ccc"><%=VERSION%></div>
<!--
<iframe id="goif" src="" style=""></iframe>
-->
<iframe id="goif" src="" style="position:absolute;top:-500px;left:-500px;width:200px;height:200px;"></iframe>
</body>
</html>
<%

if VERSION = "aspgo" then
	response.redirect "RAXS_Logout.asp?lr="& lr &"&returl="& Server.URLEncode(returl) &""
end if

%>

