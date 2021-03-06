/*
*********************************************************
 RA

 REQUIRES JS:
	<script src="/BFWglobal/js/json2.js" type="text/javascript"></script>
	<script src="/BFWglobal/js/jquery/jquery-1.3.2.min.js" type="text/javascript"></script>
	<script src="/BFWglobal/js/global.js" type="text/javascript"></script>
	<script src="/BFWglobal/js/cookies.js" type="text/javascript"></script>
	<script src="/BFWglobal/js/BFW_LogError.js" type="text/javascript"></script>
	<script src="/BFWglobal/js/BFW_Error.js" type="text/javascript"></script>
	<script src="/BFWglobal/RAg/v2.0/RAWS.js" type="text/javascript"></script>
 REQUIRES WEBSERVICE PROXY AT LOCAL DOMAIN:
 	The pseudo code below shows which types of server-side script proxies are currently supported, based on the RA.ProxyType variable 
	(Which is by default set to BFW_SERVER_WS_PROXY_TYPE in /BFWglobal/js/global.js
 	switch (RA_CtrlWin.RA.ProxyType) {
 	case 'asp' :
		/BFWglobal/ws/proxy.asp
		break;
	default :
		/BFWglobal/ws/proxy.asp
	}
 USES HTML:
	/BFWglobal/RAg/v2.0/*.html
	
*********************************************************
*/

var RA_CtrlWin = window.self;
var RA = new RAObj();

RAWaitForTimeOutError = new Error("RA WaitFor timedout.");
RAWaitForTimeOutError.name = 'RAWaitForTimeOutError';

RAXSInitializeError = new Error("RAXS did not initialize.");
RAXSInitializeError.name = 'RAXSInitializeError';

RAWSWaitForTimeOutError = new Error("RAWS WaitFor timedout.");
RAWSWaitForTimeOutError.name = 'RAWSWaitForTimeOutError';

RAWSCallError = new Error("RAWS call error.");
RAWSCallError.name = 'RAWSCallError';

// *********************************************************
// RAObj
// *********************************************************
// Constructor
function RAObj (
) {
	this.debugMsg = '';
	this.dev = BFW_QStr['radev'];
	if (!this.dev) this.dev = '';
	this.ProxyType = RA_CtrlWin.BFW_SERVER_WS_PROXY_TYPE;
	this.LocalProxyURL = '';
	this.LocalRAifURL = '';
	this.UsingClasses = false;
	this.RAifCloseAlwaysUpdate = false;
	this.CookiePath = '/';
	this.GhostURL = null;
	this.winCheck = function (check) {
		if (check) {
			if (BFW_QStr['radev']=='yes') {
			if (top!=RA_CtrlWin) {
				var RAWin = window.open( RA_CtrlWin.location.href, 'RAWin' );
				var xhtml = '';
				html += '<a href="'+ RA_CtrlWin.location.href +'">click here</a>';
				try{
				document.write( html );
				}catch(e){
				alert(e.message);
				}
			}
			}
		}
	}
	this.RARootDomain = 'bcs.bfwpub.com';
	this.RAXSURL = this.RARootDomain +'/RA/RAXS/v1.3'
	this.OldLoginRefURL = this.RARootDomain +'/login_reference';
	if (window.location.host.indexOf('192.168.77.24')==0)
	{
		this.RARootDomain = '192.168.77.242';
	}
	else if (window.location.host.indexOf('dev-')==0)
	{
		this.RARootDomain = 'dev-bcs.bfwpub.com';
	}
	else if (window.location.host.indexOf('int-')==0)
	{
		this.RARootDomain = 'int-bcs.bfwpub.com';
	}
	else if (window.location.host.indexOf('stg-')==0)
	{
		this.RARootDomain = 'stg-bcs.bfwpub.com';
	}

	this.PersistentSession = false

	this.Sites = new Object();
	this.CurrentSite = null;
	this.CurrentSiteInited = false;

	this.SiteAssignments = new Object();

	this.Packages = new Object();

	this.Batches = new Object();

	this.Users = new Object();
	this.CurrentUser = null;

	this.SiteLogins = new Object();
	this.UserAssignments = new Object();

	this.UseClasses = true;
	this.Classes = new Object();
	this.CurrentClass = null;

	this.ClassLogins = new Object();


	this.Products = new Object();

	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Cart

	this.Cart = new Object();
	this.Cart.Items = new Object();
	this.Cart.Items_ct = 0;
	this.Cart.Items_InCart_ct = 0;
	this.Cart.RA = this;
	this.Cart.NewItem = function (Product, ItemID, Price, PackageID, LevelOfAccess, ExpType, ExpValue) {
		if (Product) {
		if (this.RA.Products[Product.ID]){
			this.Items[Product.ID+'_'+ItemID] = new Object();
			this.Items[Product.ID+'_'+ItemID].Product = Product;
			this.Items[Product.ID+'_'+ItemID].ItemID = ItemID;
			this.Items[Product.ID+'_'+ItemID].Price = Price;
			this.Items[Product.ID+'_'+ItemID].PackageID = PackageID;
			this.Items[Product.ID+'_'+ItemID].LevelOfAccess = LevelOfAccess;
			this.Items[Product.ID+'_'+ItemID].ExpType = ExpType;
			this.Items[Product.ID+'_'+ItemID].ExpValue = ExpValue;
			this.Items[Product.ID+'_'+ItemID].InCart = false;
			this.Items_ct ++;
			return this.Items[Product.ID+'_'+ItemID];
		}
		}
	}
	this.Cart.AddItem = function (ProductID, ItemID) {
		if (this.RA.Products[ProductID]){
		if (this.Items[ProductID+'_'+ItemID]) {
			this.Items[ProductID+'_'+ItemID].InCart = true;
			this.Items_InCart_ct ++;
			return this.Items[ProductID+'_'+ItemID];
		}
		}
	}
	this.Cart.RemoveItem = function (ProductID, ItemID) {
		if (this.RA.Products[ProductID]){
		if (this.Items[ProductID+'_'+ItemID]) {
			this.Items[ProductID+'_'+ItemID].InCart = false;
			this.Items_InCart_ct --;
			return this.Items[ProductID+'_'+ItemID];
		}
		}
	}

	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// WaitFor

	this.WaitFor_interval = null;
	this.WaitFor_timeout = null;
	this.WaitFor_timeout_ct = 30000;
	this.WaitFor_timedout = false;
	this.WaitFor = function () {
	//alert('RA.WaitFor');
		this.WaitFor_interval = window.setInterval('RA_CtrlWin.RA.WaitFor_check()', 100);
		this.WaitFor_timedout = false;
		this.WaitFor_timeout = window.setTimeout('RA_CtrlWin.RA.WaitFor_timedout=true',this.WaitFor_timeout_ct);
	}

	this.WaitFor_check = function () {
	//alert('RA.WaitFor_check');
		if (this.WaitFor_timedout) {
			this.WaitFor_error(RA_CtrlWin.RAWaitForTimeOutError);
		}
	}

	this.WaitFor_clear = function () {
	//alert('RA.WaitFor_clear');
		this.WaitFor_interval = window.clearInterval(this.WaitFor_interval);
		this.WaitFor_timeout = window.clearTimeout(this.WaitFor_timeout);
		if ( ! this.RAXS.Inited ) {
			this.WaitFor_error(RA_CtrlWin.RAXSInitializeError);
		} else {
			try { 
				this.WaitFor_go(); 
			} catch(e) { 
				alert('Error in site custom RA.WaitFor_go function: '+ e.name +' --- '+ e.message); 
				this.WaitFor_error(e);
			}
		}
	}

	this.WaitFor_error = function (e) {
	//alert('RA.WaitFor_error');
		this.WaitFor_interval = window.clearInterval(this.WaitFor_interval);
		this.WaitFor_timeout = window.clearTimeout(this.WaitFor_timeout);
		BFW_Errors.add(e,1000);
		var htmlMsg = '';
		switch (e.name) {
		case 'RAXSInitializeError' :
			htmlMsg = 'We couldn\'t initialize your session. As a result, you may not be logged in properly.'
			break;
		case 'RAWaitForTimeOutError' :
			htmlMsg = 'We couldn\'t initialize your session. As a result, you may not be logged in properly..'
			break;
		}
		try {
			this.WaitFor_error_go(1000,htmlMsg); 
		} catch(e) { 
			alert('Error in site custom RA.WaitFor_error_go function: '+ e.name +' --- '+ e.message); 
			BFW_Errors.add(e,1);
		} finally {
			BFW_Errors.LogErrors();
		}
	}

	this.WaitFor_go = function () {};

	this.WaitFor_error_go = function (severity,htmlMsg) {};

	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// RAWS

	this.RAWS = new Object();
//	this.RAWS.Send = RAWS_HTTPREQUEST;
	this.RAWS.WaitFor_timeout = null;
	this.RAWS.WaitFor_timeout_ct = 30000;
	this.RAWS.WaitFor_timedout = false;
	this.RAWS.WaitFor_Ready = false;
	this.RAWS.fn = null;
	this.RAWS.Send = function (gofn,RAWSfn,RAWSargs) {
	//alert('RA.RAWS.Send');
		this.WaitFor(gofn);
		this.fn = RAWSfn;
		try {
			this.fn(RAWSargs);
		} catch(e) {
			RA_CtrlWin.RAWSCallError = new Error( 'RAWS call error :: '+ e.name +' --- '+ e.message +'\n {{{ \n'+ new String(this.fn) +'\n }}} \n' );
			RA_CtrlWin.RAWSCallError.name = 'RAWSCallError';
			this.WaitFor_error(RA_CtrlWin.RAWSCallError);
		}
	}

	this.RAWS.WaitFor = function (fn) {
	//alert('RA.RAWS.WaitFor');
		this.WaitFor_Ready = false;
		this.WaitFor_go = fn;
		this.WaitFor_interval = window.setInterval('RA_CtrlWin.RA.RAWS.WaitFor_check()', 2000);
		this.WaitFor_timedout = false;
		this.WaitFor_timeout = window.setTimeout('RA_CtrlWin.RA.RAWS.WaitFor_timedout=true',this.WaitFor_timeout_ct);
	}

	this.RAWS.WaitFor_check = function () {
	//alert('RA.RAWS.RAWS.WaitFor_check --- '+ this.WaitFor_timedout +' --- '+ this.WaitFor_Ready);
		if (this.WaitFor_timedout) {
			this.WaitFor_error(RA_CtrlWin.RAWSWaitForTimeOutError);
		} else if (this.WaitFor_Ready) {
			this.WaitFor_clear();
		}
	}

	this.RAWS.WaitFor_clear = function () {
	//alert('RA.RAWS.RAWS.WaitFor_clear');
		this.WaitFor_interval = window.clearInterval(this.WaitFor_interval);
		this.WaitFor_timeout = window.clearTimeout(this.WaitFor_timeout);
		try { 
			setTimeout(RA_CtrlWin.RA.RAWS.WaitFor_go,10);
		} catch(e) { 
			alert('Error in site custom RA.RAWS.WaitFor_go function: '+ e.name +' --- '+ e.message); 
			this.WaitFor_error(e);
		}
	}

	this.RAWS.WaitFor_error = function (e) {
	//alert('RA.RAWS.RAWS.WaitFor_error');
		this.WaitFor_interval = window.clearInterval(this.WaitFor_interval);
		this.WaitFor_timeout = window.clearTimeout(this.WaitFor_timeout);
		var htmlMsg = '';
		switch (e.name) {
		case 'RAWSCallError' :
			htmlMsg = 'Unable to process your request. An error log is being sent to our system administrators and we\'ll be looking into immediately. Please try again in a few minutes.'
			break;
		case 'RAWSWaitForTimeOutError' :
			htmlMsg = 'The server is busy and unable to process your request at this time. Please try again in a few minutes.'
			break;
		}
		BFW_Errors.add(e,1000);
		try {
			this.WaitFor_error_go(1000,htmlMsg); 
		} catch(e) { 
			alert('Error in site custom RA.RAWS.WaitFor_error_go function: '+ e.name +' --- '+ e.message); 
			BFW_Errors.add(e,1);
		} finally {
			BFW_Errors.LogErrors();
		}
	}

	this.RAWS.WaitFor_go = function () {};

	this.RAWS.WaitFor_error_go = function (severity,htmlMsg) {if (severity>=100) alert(htmlMsg);};

	this.RAWS.UpdateServer = function () {
		if (RA_CtrlWin.RA.ProxyType!='ASP.NET')
		{
			return;
		}
		szAction = 'http://ra.bfwpub.com/RAg.Net/UpdateServer';
//            RAgLocal.Proxy( szUrl , strEnvelope ,  RAgLocalProxy_Process, RAgLocalProxy_HttpResp_Error);   
/*
POST /RAg.Net.Example/RAg/RAgLocal.asmx HTTP/1.1
Host: localhost
Content-Type: text/xml; charset=utf-8
Content-Length: length
SOAPAction: "http://tempuri.org/Proxy"

'*/
		var sendData = ''+
'<?xml version="1.0" encoding="utf-8"?>'+
'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
'  <soap:Body>'+
'    <SetServerSession xmlns="http://ra.bfwpub.com/RAg.Net/">'+
'    </SetServerSession>'+
'  </soap:Body>'+
'</soap:Envelope>';
		RA_CtrlWin.RAWS_Http = $.ajax({
			type: "POST",
			url: RA_CtrlWin.RA.LocalProxyURL+'?op=UpdateServer',
			dataType: "xml",
			data: sendData,
			processData: false,
			//contentType: 'application/xml; charset=utf-8', 
			contentType: 'text/xml; charset=utf-8', 
			beforeSend: function(req) {
				req.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
				req.setRequestHeader('SOAPAction', szAction) ;
			},
			success: function(data,textStatus){
	var errEl;
	var gotIt = '';
	errEl = data.getElementsByTagName('UpdateServerResult')[0];
	for (var i=0; i<errEl.childNodes.length; i++) {
		if (errEl.childNodes[i].nodeType==3) {
			gotIt += errEl.childNodes[i].nodeValue;
		}
	}
if (RA_CtrlWin.RA.dev_check('.net')) prompt('UpdateServerResult',gotIt);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
	var msg = '';
	msg += RA_CtrlWin.RAWS_Http.status +' ---- ';
	msg += XMLHttpRequest.status +' ---- ';
	msg += XMLHttpRequest.statusText +' ---- ';
	msg += XMLHttpRequest.responseText +' ---- ';
	msg += XMLHttpRequest.responseXML +' ---- ';
	msg += textStatus.status +' ---- ';
	msg += errorThrown +' ---- ';
if (RA_CtrlWin.RA.dev_check('.net')) prompt('UpdateServerResult error: ', msg);
			}
		});
}



	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// RAXS

	this.RAXS = new Object();
	this.RAXS.Inited = false;
	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// RAXS.Check (RALR & RAXS)
	this.RAXS.Check = function () {
var msg = '';
msg += 'RAXS.Check<br/>     ';
var dbcm = $.cookie('dbcm');
dbcm = '';

		//REMOVE ????
		if (!navigator.cookieEnabled) return;

		if (top.location.search=='' && top.location.hash=='' && top.location.pathname.indexOf('%')>=0) 
		{
			top.location.href = decodeURIComponent(top.location.href);
			return;
		}

		var RAXSsl = $.cookie('RAXSsl');
		var RAXSsd = $.cookie('RAXSsd');
		if ( (RAXSsl==''||RAXSsl==null) && (RAXSsd==''||RAXSsd==null) )
		{
		//need to check
dbcm += '***docheck';
if (RA_CtrlWin.RA.dev_check('raxs')) $.cookie('dbcm',dbcm, { path: '/' });
			var RAXSTimeStamp = RA_GetRAXSTimeStamp('c');
dbcm += '[ts='+RAXSTimeStamp+'-sd='+RAXSsd+'-Qts'+BFW_QStr['raxsts']+']';
			$.cookie('RAXSsd',RAXSTimeStamp, { path: '/' });
			var xhref = RA_GetRAXS_URL(RAXSTimeStamp);
			var gourl = RA_CtrlWin.RA.OldLoginRefURL +'/asp/c-ra.asp?m=c&returl='+ encodeURIComponent('http://'+xhref);
			top.location.href = 'http://'+ gourl;
		}
		else if (RAXSsd!=null && RAXSsd.indexOf('c')==0)
		{//back from check
dbcm += '---checked';
if (RA_CtrlWin.RA.dev_check('raxs')) $.cookie('dbcm',dbcm, { path: '/' });
dbcm += '[CHts='+RA_CheckRAXS_TimeStamp(RAXSsd)+'-sd='+RAXSsd+'-Qts'+BFW_QStr['raxsts']+']';
			if (!RA_CheckRAXS_TimeStamp(RAXSsd))
			{
dbcm += ':::sdRESET';
				$.cookie('RAXSsd','', { path: '/' });
			}
			else
			{
				if (BFW_QStr['uid'] && BFW_QStr['rau'] && !isNaN(BFW_QStr['uid']))
				{
dbcm += ':::go';
if (RA_CtrlWin.RA.dev_check('raxs')) $.cookie('dbcm',dbcm, { path: '/' });
					$.cookie('RAXSsd',BFW_QStr['uid'], { path: '/' });
					var xhref = RA_GetRAXS_URL();
					top.location.href = 'http://'+ xhref;
				} 
				else 
				{
dbcm += ':::NO go';
				}
			}
		}
		else if (RAXSsd!=null && RAXSsd.indexOf('i')==0)
		{//back from in
dbcm += '---in';
if (RA_CtrlWin.RA.dev_check('raxs')) $.cookie('dbcm',dbcm, { path: '/' });
dbcm += '[CHts='+RA_CheckRAXS_TimeStamp(RAXSsd)+'-sd='+RAXSsd+'-Qts'+BFW_QStr['raxsts']+']';
			if (!RA_CheckRAXS_TimeStamp(RAXSsd))
			{
dbcm += ':::sdRESET';
				$.cookie('RAXSsd','', { path: '/' });
			}
			else
			{
				$.cookie('RAXSsd','', { path: '/' });
				var xhref = RA_GetRAXS_URL();
dbcm += ':::go';
				top.location.href = 'http://'+ xhref;
			}
		}
		else if (RAXSsd!=null && RAXSsd.indexOf('o')==0)
		{//back from out
dbcm += '---out';
if (RA_CtrlWin.RA.dev_check('raxs')) $.cookie('dbcm',dbcm, { path: '/' });
dbcm += '[CHts='+RA_CheckRAXS_TimeStamp(RAXSsd)+'-sd='+RAXSsd+'-Qts'+BFW_QStr['raxsts']+']';
			if (!RA_CheckRAXS_TimeStamp(RAXSsd))
			{
dbcm += ':::sdRESET';
				$.cookie('RAXSsd','', { path: '/' });
			}
			else
			{
				$.cookie('RAXSsd',0, { path: '/' });
				var xhref = RA_GetRAXS_URL();
dbcm += ':::go';
if (RA_CtrlWin.RA.dev_check('raxs')) $.cookie('dbcm',dbcm, { path: '/' });
				top.location.href = 'http://'+ xhref;
			}
		}
		else if (RAXSsd!=null && !isNaN(RAXSsd)&&RAXSsd!='')
		{//use to set
dbcm += '---use';
dbcm += '[CHts='+RA_CheckRAXS_TimeStamp(RAXSsd)+'-sd='+RAXSsd+'-Qts'+BFW_QStr['raxsts']+']';
			if (RAXSsd<=0)
			{
dbcm += ':::set zero';
				$.cookie('RAXSsd',0, { path: '/' });
			}
			else 
			{//don't use to set, local already (or still) defined
dbcm += ':::set';
			}
		}
		else
		{
		//static
dbcm += '---static';
dbcm += '[CHts='+RA_CheckRAXS_TimeStamp(RAXSsd)+'-sd='+RAXSsd+'-Qts'+BFW_QStr['raxsts']+']';
			$.cookie('RAXSsd','', { path: '/' });
		}
if (RA_CtrlWin.RA.dev_check('raxs')) $.cookie('dbcm',dbcm, { path: '/' });

RA_CtrlWin.RA.logDebug( msg );
if (RA_CtrlWin.RA.dev_check('raxs')) RA_CtrlWin.RA.logDebug( '<br/>'+ dbcm );

RA_CtrlWin.RA.dumpDebug();
	}

	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// RAXS.InitSession
	
	this.RAXS.InitSession = function (fn) {
var msg = '';
msg += 'RAXS.InitSession: RAXSsd: '+ $.cookie('RAXSsd') +' - RAu:'+ $.cookie('RAu') +' - RAXSsl: '+ $.cookie('RAXSsl') +'<br/>'
//alert('RAXS.InitSession: RAXSsd: '+ $.cookie('RAXSsd') +' - RAu:'+ $.cookie('RAu') +' - RAXSsl: '+ $.cookie('RAXSsl'));

		RA_tempFn = function () {
		};
		if (fn) RA_tempFn = fn;
msg += 'RAXS.InitSession 1';
msg += '<br/>'

		var act = 'clear';

		var RAXSsl = $.cookie('RAXSsl');
		var RAXSsd = $.cookie('RAXSsd');
		$.cookie('RAXSsd','', { path: '/' });
		if (RAXSsd==null || RAXSsd=='' || isNaN(RAXSsd))
		{//do nothing
			if (RAXSsl==null || RAXSsl=='' || isNaN(RAXSsl))
			{
//alert('1.1');
				act = 'clear';
			}
			else if (RAXSsl>0&&RAXSsl<3)
			{
//alert('1.2');
				if (RA_CtrlWin.RA.UsingClasses==true && RA_CtrlWin.RA.CurrentUser != null) 
				{
					act = 'go';
				} 
				else
				{
					act = 'load';
				}
			}
			else
			{
//alert('1.3');
				act = 'clear';
			}
		}
		else
		{
			if (RAXSsd>0)
			{
//alert('2.1');
				act = 'go';
			}
			else 
			{
//alert('2.2');
				act = 'clear';
			}
		}
		switch (act)
		{
		case 'load':
//alert('Load');
msg += 'LoadSession';
msg += '<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
			RA_CtrlWin.RA.LoadSession();
			RA_CtrlWin.RA.RAXS.InitSession_4();
			break;
		case 'go':
//alert('GO');
msg += 'RAXS_WS';
msg += '<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
			$.cookie('RAXSsl',2, { path: RA_CtrlWin.RA.CookiePath });
			RA_CtrlWin.RAWS_WaitFor( RA_CtrlWin.RA.RAXS.InitSession_2_go );
			RA_CtrlWin.RAXS_WS( new Array( 'iUserID='+ RAXSsd ) );
			break;
		default :
//alert('Clear');
msg += 'ClearUser';
msg += '<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
			RA_CtrlWin.RA.ClearUser();
			RA_CtrlWin.RA.RAXS.InitSession_4();
		}
	}

	this.RAXS.InitSession_2_go = function () {
//alert('InitSession_2_go');
//		RA_CtrlWin.RAWS_WaitFor_Ready = true;
		RA_CtrlWin.RA.RAXS.InitSession_2();
	}

	this.RAXS.InitSession_2 = function () {
var msg = '';
msg += 'RAXS.InitSession_2<br/>'
//alert('InitSession_2');
		this.Inited = true;
//alert(RA_CtrlWin.RAXS_WS_XML);
		var x = new Array();
//prompt('RA_CtrlWin.RAWS_XML.xml',RA_CtrlWin.RAXS_WS_XML.xml );

		if ( RA_CtrlWin.RAWS_error=='' ) {
//prompt('RAXS_WS',$('RAXS_WS',RA_CtrlWin.RAXS_WS_XML) );
//alert($('RAXS_WS:first',RA_CtrlWin.RAXS_WS_XML) );
//alert( RA_CtrlWin.RAXS_WS_XML);
//prompt('RA_CtrlWin.RAWS_error',RA_CtrlWin.RAWS_error);
var $oID = $('RAXS_WS > results > udtUserProfile > iUserID',RA_CtrlWin.RAXS_WS_XML);
//prompt('RAXS_WS > results > udtUserProfile', $oID.length );
//prompt('$oID iUserID', $('RAXS_WS > results > udtUserProfile > iUserID',$oID) );
		if ($oID) {
		var len = $oID.length;
		if (len > 0) {
			$o1 = $('RAXS_WS > results > udtUserProfile',RA_CtrlWin.RAXS_WS_XML);
			x[0] = $('iUserID',$o1).text();
			x[1] = $('sUserName',$o1).text();
			x[2] = $('sPassword',$o1).text();
			x[3] = $('sFirstName',$o1).text();
			x[4] = $('sLastName',$o1).text();
			x[5] = $('sPasswordHint',$o1).text();
			x[6] = $('sMailPreference',$o1).text();
			x[7] = $('sOptInEmail',$o1).text();
			x[8] = $('iGUID',$o1).text();
//alert('yo yo');
			var $o2 = $('RAXS_WS > results > udtClass',RA_CtrlWin.RAXS_WS_XML);

			RA_CtrlWin.RA.CurrentUser = RA_CtrlWin.RA.AddUser( x[0], x[1], x[3], x[4], x[5], x[6], x[7], '0', '1', $o2.length );
			RA_CtrlWin.RA.CurrentUser.ClassUsing = null;
			RA_CtrlWin.RA.CurrentUser.GUID = x[8];
			RA_CtrlWin.RA.CurrentUser.IP = $('RAXS_WS > results > IP',RA_CtrlWin.RAXS_WS_XML).text();

			var RAXS_ClassCreators = new Object();
			for (var i=0; i<$o2.length; i++) {
				x = new Array();
				x[0] = $(' > iClassID', $o2[i]).text();
				x[1] = $(' > iCreatorID', $o2[i]).text();
				x[2] = $(' > sClassName', $o2[i]).text();
				x[3] = $(' > sClassDesc', $o2[i]).text();
				x[4] = $(' > sClassCode', $o2[i]).text();
				x[5] = $(' > dtExprn', $o2[i]).text();
				x[6] = $(' > iUserID', $o2[i]).text();
				x[7] = $(' > bClassAccessRevoked', $o2[i]).text();
				x[8] = $(' > dtLastLogin', $o2[i]).text();
				x[9] = $(' > dtStartDate', $o2[i]).text();
				x[10] = $(' > dtEndDate', $o2[i]).text();
				x[11] = $(' > bEmailScores', $o2[i]).text();
				x[12] = $(' > iRecordStatus', $o2[i]).text();
				x[13] = $(' > sCreatorEmail', $o2[i]).text();
				x[14] = $(' > sCreatorFName', $o2[i]).text();
				x[15] = $(' > sCreatorLName', $o2[i]).text();

				if (x[1]==RA_CtrlWin.RA.CurrentUser.ID) {
					RAXS_ClassCreators[x[0]] = RA_CtrlWin.RA.CurrentUser;
				} else {
					RAXS_ClassCreators[x[0]] = RA_CtrlWin.RA.AddUser( x[1], x[13], x[14], x[15], '', '', '', '', '', 0 );
				}

				RA_CtrlWin.RA.AddClass( x[0], x[2], x[3], x[4], x[5], RAXS_ClassCreators[x[0]], x[9], x[10], x[11], x[12] );
				RA_CtrlWin.RA.AddClassLogin( RA_CtrlWin.RA.CurrentUser, RA_CtrlWin.RA.Classes[x[0]], x[7], x[8] );

			}

			$o2 = $('RAXS_WS > results > udtPackage',RA_CtrlWin.RAXS_WS_XML);
			for (var i=0; i<$o2.length; i++) {
				x = new Array();
				x[0] = '';
				x[1] = $(' > iPackageID',$o2[i]).text();
				x[2] = $(' > dExpiration',$o2[i]).text();
//alert( ' ADDING PACKAGE: '+ x[0] +' -- '+ x[1] +' -- '+ x[2] +' -- '+ RA_CtrlWin.RA.Packages[ x[1] ] +' -- '+ RA_CtrlWin.RA.CurrentUser);
				if ( RA_CtrlWin.RA.Packages[ x[1] ] ) {
					RA_CtrlWin.RA.AddUserAssignment( '', RA_CtrlWin.RA.CurrentUser, RA_CtrlWin.RA.Packages[ x[1] ], '', x[2] );
				}
			}
var str = '';
//alert('1:'+ len);
str += x[1] +' : '+ x[4] +' : '+ x[13] +'\n';
//alert(str);
		}
		}
		} else {
msg += '<span style="color:red;font-weight:bold">ERROR:</span> '+ RA_CtrlWin.RAWS_error +'<br/>'
prompt('error',RA_CtrlWin.RAWS_error);
		}

RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
		RA_CtrlWin.RA.RAXS.InitSession_3();
	}

	this.RAXS.InitSession_3 = function () {
var msg = '';
msg += 'RAXS.InitSession_3<br/>'
		if (RA_CtrlWin.RA.CurrentUser != null && RA_CtrlWin.RA_OnyxISBN!='') {
			if (RA_CtrlWin.RA.CurrentSiteAccess >= 40) {
				RA_CtrlWin.RA.CurrentUser.OnyxStatus = 2;
			} else {
				RA_CtrlWin.RAWS_WaitFor( RA_CtrlWin.RA.RAXS.InitSession_4_go );
				RA_CtrlWin.IL_CheckInstructorAccess( new Array( "iUserID="+ RA_CtrlWin.RA.CurrentUser.ID, "sISBN="+ RA_CtrlWin.RA_OnyxISBN ) );
			}
		} else {
			RA_CtrlWin.RA.RAXS.InitSession_4();
		}
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
	}

	this.RAXS.InitSession_4_go = function () {
var msg = '';
msg += 'RAXS.InitSession_4_go<br/>'
msg += 'RAWS_iUserInstructorStatus = '+ RA_CtrlWin.RAWS_iUserInstructorStatus +'<br/>'
		RA_CtrlWin.RA.CurrentUser.OnyxStatus = RA_CtrlWin.RAWS_iUserInstructorStatus;
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
//alert(RA_CtrlWin.RAWS_iUserInstructorStatus);
//prompt('',RA_CtrlWin.RAWS_XML.getElementsByTagName('sretvalue')[0]);

		RA_CtrlWin.RA.RAXS.InitSession_4();
	}

	this.RAXS.InitSession_4 = function () {
var msg = '';
msg += 'RAXS.InitSession_4<br/>'
RA_CtrlWin.RA.dumpDebug();
//alert('InitSession_4');
		this.Inited = true;
		RA_CtrlWin.RA.InitCurrentUser( RA_tempFn );
	}

	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// RAif

	this.RAif = Object();

	this.RAif._if = null;
	this.RAif._win = null;

	this.RAif.WaitFor_interval = null;
	this.RAif.WaitFor_intervalX = 100;
	this.RAif.WaitFor_state = false;

	this.RAif.WaitFor = function () {
	//alert('RAif_WaitFor');
		this.WaitFor_state = false;
		this.WaitFor_interval = window.setInterval('RA_CtrlWin.RA.RAif.WaitFor_state_check()', this.WaitFor_intervalX);
	}

	this.RAif.WaitFor_state_check = function () {
		if (this.WaitFor_state==true) {
			this.WaitFor_clear();
		}
	}

	this.RAif.WaitFor_clear = function () {
	//alert('this.WaitFor_clear');
		this.WaitFor_state = true;
		this.WaitFor_interval = window.clearInterval(this.WaitFor_interval);
//		this.Resize();
	}

	this.RAif.Resize = function () {
	//alert('RA.RAif.Resize');
		try {
			this._if = this.win.$('#RAif')[0];
			this._win = this._if.contentWindow;
			if (this._win!=null) {
				var h = this._win.document.body.offsetHeight;
				h += 20;
				this._if.style.height = h + 'px';
			}
		} catch(e) {
		}
		try {
			RA_CtrlWin.RAif_Site_Resize();
		} catch(e) {
		}
	}
	this.RAif.updated = false;
	this.RAif.updated_needsRAXS = false;
	this.RAif.Clear = function () {
			this.updated = false;
			this.updated_needsRAXS = false;
			this.vars = new Object();
		}
	this.RAif.vars = new Object();
	this.RAif.switches = new Object();
	this.RAif.div_ID = 'RAif_div';
	this.RAif.win = window.self;
	this.RAif.inited = false;
	this.RAif.UseIFrame = false;
	this.RAif.init = function (s,m,RAif_winFrame_ID,RAif_div_ID) {
			this.state.last = s;
			$.cookie('RAifL',s, { path: RA_CtrlWin.RA.CookiePath });
			this.state.push(s);
			this.mode = m;

			this.WaitFor();

			if (RAif_div_ID && RAif_div_ID!='') this.div_ID = RAif_div_ID;

			var RAif_div;
			this.win = window.self;
			if (RAif_winFrame_ID && RAif_winFrame_ID!='') 
			{
				try {
					this.win = $('#'+RAif_winFrame_ID)[0].contentWindow;
				} catch(e) {
					try {
						this.win = window.self;
					} catch(e) {
						alert( 'Error, cannot initialize RAif :: '+ e.name +' --- '+ e.message );
					}
				}
			}
			try {
				RAif_div = this.win.$('#'+this.div_ID)[0];
			} catch(e) {
				try {
					RAif_div = this.win.$('#'+this.div_ID)[0];
				} catch(e) {
					alert( 'Error, cannot initialize RAif :: '+ e.name +' --- '+ e.message );
					return;
				}
			}

			var box = '';
			box += '<table id="RAif_divTbl" border="0" cellpadding="0" cellspacing="0">';
			box += '<tr>';
			box += '<td id="RAif_divTbl_topLeft">&nbsp;</td>';
			box += '<td id="RAif_divTbl_topCenter">&nbsp;</td>';
			box += '<td id="RAif_divTbl_topRight">&nbsp;</td>';
			box += '</tr>';
			box += '<tr>';
			box += '<td id="RAif_divTbl_midLeft">&nbsp;</td>';
			box += '<td id="RAif_divTbl_midCenter">';
		    if (this.UseIFrame == true) 
		    {
			    box += '<iframe id="RAif" style="width: 100%; background-color:transparent; padding:0px; margin:0px;" src="" frameBorder="0" scrolling="no"></iframe>'
		    }
		    else
		    {
			    box += '<div id="RA_Page"></div>'
		    }
			box += '</td>';
			box += '<td id="RAif_divTbl_midRight">&nbsp;</td>';
			box += '</tr>';
			box += '<tr>';
			box += '<td id="RAif_divTbl_botLeft">&nbsp;</td>';
			box += '<td id="RAif_divTbl_botCenter">&nbsp;</td>';
			box += '<td id="RAif_divTbl_botRight">&nbsp;</td>';
			box += '</tr>';
			box += '</table>';
//			RAif_div.innerHTML = box;
			$(RAif_div).html(box);
		    if (this.UseIFrame == true) 
		    {
			    var winhost = window.location.host;
			    if (winhost.indexOf('localhost:')==0 && RA_CtrlWin.RA.ProxyType=='ASP.NET' && RA_CtrlWin.RA.LocalRAifURL!='')
			    {
				    this.win.$('#RAif')[0].src = RA_CtrlWin.RA.LocalRAifURL +'?url='+ encodeURIComponent(RA_CtrlWin.location.href);
			    }
			    else
			    {
				    this.win.$('#RAif')[0].src = '/BFWglobal/RAg/v2.0/RAif.html?url='+ encodeURIComponent(RA_CtrlWin.location.href);
			    }
		    }
		    else
		    {
                RA_CtrlWin.RA.RAif.CreateApp();
	            setTimeout('RA_CtrlWin.RA.RAif.app.Init()',20);
		    }
//			RAif_div.style.display='block';
            $(RAif_div).show();
//			$('*',RAif_div).show();
			this.inited = true;
		}

	this.RAif.close = function () {
			//problem with state.last??
			RA_CtrlWin.RA.SetClassUsing();
			while (this.state.stack.length>0) {
				this.state.stack.pop();
			}
if (RA_CtrlWin.RA.dev_check('raifstate')) alert(this.state.last);
		    if (this.UseIFrame == true) 
		    {
			    this._if.src = '';
		    }
		    else
		    {
		        RA_CtrlWin.RA.RAif.DestroyApp();
		    }
		    this.win.$('#'+this.div_ID).html('').hide('','');
			this.inited = false;
			if (this.updated_needsRAXS) {
//alert('RAif close: '+ RA_CtrlWin.RA.CurrentUser);
				this.close_site();
				$.cookie('RAXSsl',2, { path: RA_CtrlWin.RA.CookiePath });
				var gourl = '';
				if (RA_CtrlWin.RA.CurrentUser != null) {
					var RAXSTimeStamp = RA_GetRAXSTimeStamp('i');
					$.cookie('RAXSsd',RAXSTimeStamp, { path: '/' });
					var xhref = RA_GetRAXS_URL(RAXSTimeStamp);
gourl = 'http://'+ RA_CtrlWin.RA.OldLoginRefURL +'/asp/c-ra.asp?m=i&u='+RA_CtrlWin.RA.CurrentUser.ID+'&returl='+ encodeURIComponent('http://'+xhref);
				} else {
					var RAXSTimeStamp = RA_GetRAXSTimeStamp('o');
					$.cookie('RAXSsd',RAXSTimeStamp, { path: '/' });
					var xhref = RA_GetRAXS_URL(RAXSTimeStamp);
gourl = 'http://'+ RA_CtrlWin.RA.OldLoginRefURL +'/asp/c-ra.asp?m=o&returl='+ encodeURIComponent('http://'+xhref);
				}
				setTimeout('top.location.href=\''+ gourl+'\'',200);
			} else {
				this.close_site();
				if (this.updated) {
					RA_CtrlWin.RA.SaveSession();
					this.Clear();
				}
			}
		}

	this.RAif.close_site = function () {
//	alert('RAif.close_site DEFAULT');
	}

	this.RAif.state = new Object();
	this.RAif.state.last = $.cookie('RAifL');

//	this.RAif.state.last = '';
//	$.cookie('RAifL','', { path: RA_CtrlWin.RA.CookiePath });

	this.RAif.state.clearLast = function () {
		this.last = '';
		$.cookie('RAifL','', { path: RA_CtrlWin.RA.CookiePath });
	}
	this.RAif.state.stack = new Array();
	this.RAif.state.current = function () {
		if (this.stack.length > 0) {
			return this.stack[this.stack.length-1];
		} else {
			return '';
		}
	}
	this.RAif.state.push = function (s) {
		if (s) {
			if (s!='') {
				if (this.stack.length>0) {
					if (s!=this.stack[this.stack.length-1]) {
						this.stack.push(s);
					}
				} else {
					this.stack.push(s);
				}
			}
		}
		return this.stack[this.stack.length-1];
	}
	this.RAif.state.pop = function () {
		var ret = '';
		if (this.stack.length > 0) {
			this.last = this.current();
			$.cookie('RAifL',this.last, { path: RA_CtrlWin.RA.CookiePath });
			this.stack.pop();
			if (this.stack.length > 0) {
				ret = this.stack[this.stack.length-1];
			}
		}
		return ret;
	}
	this.RAif.state.next = function (ct) {
		var ret = '';
		var xct = 2;
		if (ct) if (ct>2) xct = ct;
		if (this.stack.length > 1) {
			ret = this.stack[this.stack.length-xct];
		}
		return ret;
	}

}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.logDebug = function (msg) {
	this.debugMsg += msg;
}

RAObj.prototype.dumpDebug = function () {
	$('#RA_debugmsg').append( this.debugMsg );
	this.debugMsg = '';
}

RAObj.prototype.resetDebug = function () {
	$('#RA_debugmsg').html( '' );
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.setOptions = function (inOptions) {
/*
	this.debugMsg = '';
	this.dev = BFW_QStr['radev'];
	if (!this.dev) this.dev = '';
	this.ProxyType = RA_CtrlWin.BFW_SERVER_WS_PROXY_TYPE;
	this.LocalProxyURL = '';
	this.LocalRAifURL = '';
	this.PersistentSession = false
	this.UsingClasses = false;
	this.RAifCloseAlwaysUpdate = false;
	this.CookiePath = '/';
	this.GhostURL = null;
	this.RARootDomain = 'bcs.bfwpub.com';
	this.RAXSURL = this.RARootDomain +'/RA/RAXS/v1.3'
	this.OldLoginRefURL = this.RARootDomain +'/login_reference';
	this.RAif.UseIFrame = false;
*/
    if (inOptions.UseIFrame) {
	    this.RAif.UseIFrame = inOptions.UseIFrame;
    }
    if (inOptions.dev) {
        this.dev = inOptions.dev;
    }
    if (inOptions.ProxyType) {
        switch (inOptions.ProxyType)
        {
            case 'ASP.NET':
                this.ProxyType = inOptions.ProxyType;
                break
            default:
                this.ProxyType = inOptions.BFW_SERVER_WS_PROXY_TYPE;
        }
    }
    if (this.ProxyType=='ASP.NET' && inOptions.LocalProxyURL) {
        this.LocalProxyURL = inOptions.LocalProxyURL;
    }
    if (this.ProxyType=='ASP.NET' && inOptions.LocalRAifURL) {
        this.LocalRAifURL = inOptions.LocalRAifURL;
    }
    if (inOptions.PersistentSession) {
        this.PersistentSession = inOptions.PersistentSession;
    }
    if (inOptions.UsingClasses) {
        this.UsingClasses = inOptions.UsingClasses;
    }
    if (inOptions.RAifCloseAlwaysUpdate) {
        this.RAifCloseAlwaysUpdate = inOptions.RAifCloseAlwaysUpdate;
    }
    if (inOptions.WaitFor_go && typeof inOptions.WaitFor_go === 'function') {
    	this.WaitFor_go = inOptions.WaitFor_go;
    }
    if (inOptions.WaitFor_error_go && typeof inOptions.WaitFor_error_go === 'function') {
    	this.WaitFor_error_go = inOptions.WaitFor_error_go;
    }

}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var RA_tempSiteBaseURLs = '';
var RA_Init_tempFn = function () {
//alert('RA_tempFn');
};
var RA_tempFn = function () {
//alert('RA_tempFn');
};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.UnInit = function () {
	if (!this.PersistentSession) {
//		$.cookie('RAu','', { path: RA_CtrlWin.RA.CookiePath });
	}
};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.Init = function (fn,ghostURL) {
	try {
		var x = top.location.href;
		if (x != window.location.href) {
		try {
$('body').html('<a href="'+ window.location.href +'" target="_blank">click here</a>');
		} catch(e) {
		try {
		document.write('<a href="'+ window.location.href +'" target="_blank">click here</a>');
		} catch(e) {}
		}
		try {
$('body').html('<a href="'+ window.location.href +'" target="_blank">click here</a>');
		} catch(e) {
		try {
		document.write('<a href="'+ window.location.href +'" target="_blank">click here</a>');
		} catch(e) {}
		}
		return;
		}
	} catch(e) {
		try {
var y = window.open(window.location.href,'RATOPWIN');
		} catch(e) {}
		try {
$('body').html('<a href="'+ window.location.href +'" target="_blank">click here</a>');
		} catch(e) {document.write('');}
		return;
	}
var msg = '';
msg += 'RA.Init<br/>'
msg += 'RAXSsd: '+ $.cookie('RAXSsd') +' - RAu:'+ $.cookie('RAu') +' - RAXS: '+ $.cookie('RAXSsl') +'<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
//alert(fn);
	if (fn) RA_Init_tempFn = fn;
	if (ghostURL) {
		this.GhostURL = ghostURL;
		this.usingGhostURL = true;
	}
	RA_CtrlWin.RA.InitCurrentSite( '', RA_CtrlWin.RA.Init_2);
};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.Init_2 = function (fn) {
//alert('Init_2');
	RA_CtrlWin.RA.Init_2_go();
}
RAObj.prototype.Init_2_go = function (fn) {
//alert('Init_2_go');
//alert(RA_Init_tempFn);
var msg = '';
msg += 'RA.Init_2_go<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
	RA_CtrlWin.RA.RAXS.InitSession( RA_Init_tempFn );
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.InitCurrentSite = function ( sBaseURL, fn) {
var msg = '';
msg += 'RA.InitCurrentSite<br/>'
	var inputAr = new Array();
	if (!sBaseURL || sBaseURL=='') {
msg += 'no input BaseURL<br/>'
/*
		var x = window.location.host + window.location.pathname;
		x = x.replace('/default.html','').replace('/defaultjj.asp','');
		RA_tempSiteBaseURLs += ' -- '+x;
		inputAr[0] = 'sBaseUrl='+ x;
*/
		var x = window.location.host + window.location.pathname;
		x = x.replace('_0609qa','');
		if (this.GhostURL!=null) x = this.GhostURL;
		var y = x.split('/');
		for (var i=0; i<y.length; i++) {
			var z = '';
			for (var j=0; j<i; j++) {
				z += y[j];
				if (j<i-1) {}
				z += '/';
			}
			z += y[j];
			RA_tempSiteBaseURLs += ' -- '+z;
			inputAr[inputAr.length] = 'sBaseUrl='+ z;
			var xln = inputAr.length-1;
msg += 'sBaseURL['+ xln +'] = '+ z +'<br/>'
		}
		for (var i=0; i<inputAr.length; i++) {
//alert( inputAr[i] );
		}
	} else {
		RA_tempSiteBaseURLs += ' -- '+sBaseURL;
		inputAr[0] = 'sBaseUrl='+ sBaseURL
	}
//alert( RA_tempSiteBaseURLs );
	RA_tempFn = function () {};
	if (fn) RA_tempFn = fn;

msg += 'doing RAWS3_GetSiteFromBaseURL_WithProducts<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
	RAWS_WaitFor( RA_CtrlWin.RA.InitCurrentSite_2_go );
	RAWS3_GetSiteFromBaseURL_WithProducts( inputAr );
}
RAObj.prototype.InitCurrentSite_2_go = function () {
//alert('InitCurrentSite_2_go');
	RA_CtrlWin.RA.InitCurrentSite_2();
}
RAObj.prototype.InitCurrentSite_2 = function () {
//alert('RA.InitCurrentSite_2 : '+ RAWS_iSiteID +' -- '+ RA_tempSiteBaseURLs );
var msg2 = '';
var msg = '';
msg += 'processing RAWS3_GetSiteFromBaseURL_WithProducts<br/>'
	if (RAWS_udtSites && RAWS_error=='') {
		var S, PS, P, SA, B;
		for (var iS in RAWS_udtSites) {if (RAWS_udtSites.hasOwnProperty(iS)) {
			S = RA_CtrlWin.RA.AddSite( RAWS_udtSites[iS].SiteID, RAWS_udtSites[iS].BaseURL, '' );
//msg2 += '\n SITE '+ S.ID;
			RA_CtrlWin.RA.CurrentSite = S;
			RA_CtrlWin.RA.CurrentSiteInited = true;
			if (this.GhostURL==null)
			{
				RA_CtrlWin.RA.CookiePath = S.BaseURL.substring(S.BaseURL.indexOf('/'));
			}
			else
			{
				var thisLoc = window.location.pathname ;
				RA_CtrlWin.RA.CookiePath = thisLoc.substring(0,thisLoc.indexOf('/',1));
			}

var cstr = '';
			for (var iP in RAWS_udtSites[iS].Packages) {if (RAWS_udtSites[iS].Packages.hasOwnProperty(iP)) {
				P = RA_CtrlWin.RA.AddPackage( RAWS_udtSites[iS].Packages[iP].PackageID, RAWS_udtSites[iS].Packages[iP].Description, RAWS_udtSites[iS].Packages[iP].Type );
cstr += 'Package.ID: '+ P.ID +'\n';
				for (var iSA in RAWS_udtSites[iS].Packages[iP].SiteAssignments) {if (RAWS_udtSites[iS].Packages[iP].SiteAssignments.hasOwnProperty(iSA)) {
					var tmpSID = RAWS_udtSites[iS].Packages[iP].SiteAssignments[iSA].SiteID;
if (P.ID==307) {
cstr += '.SiteID: '+ RAWS_udtSites[iS].Packages[iP].SiteAssignments[iSA].SiteID +'\n';
cstr += '.BaseURL: '+ RAWS_udtSites[iS].Packages[iP].SiteAssignments[iSA].BaseURL +'\n';
}
					if (! RA_CtrlWin.RA.Sites[tmpSID] ) {
						PS = RA_CtrlWin.RA.AddSite( RAWS_udtSites[iS].Packages[iP].SiteAssignments[iSA].SiteID, RAWS_udtSites[iS].Packages[iP].SiteAssignments[iSA].BaseURL, RAWS_udtSites[iS].Packages[iP].SiteAssignments[iSA].SiteDesc );
					} else {
						PS = RA_CtrlWin.RA.Sites[tmpSID];
					}
					SA = RA_CtrlWin.RA.AddSiteAssignment( RAWS_udtSites[iS].Packages[iP].SiteAssignments[iSA].SiteAssignmentID, P, PS, RAWS_udtSites[iS].Packages[iP].SiteAssignments[iSA].LevelOfAccess );
//msg2 += '\n SA '+ SA.Site.ID;
				}}
				for (var iB in RAWS_udtSites[iS].Packages[iP].Batches) {if (RAWS_udtSites[iS].Packages[iP].Batches.hasOwnProperty(iB)) {
					B = RA_CtrlWin.RA.AddBatch( RAWS_udtSites[iS].Packages[iP].Batches[iB].BatchID, RAWS_udtSites[iS].Packages[iP].Batches[iB].Description, P, RAWS_udtSites[iS].Packages[iP].Batches[iB].UseByDate, RAWS_udtSites[iS].Packages[iP].Batches[iB].RelativeExpiration,  RAWS_udtSites[iS].Packages[iP].Batches[iB].AbsoluteExpiration,  RAWS_udtSites[iS].Packages[iP].Batches[iB].Suspended, RAWS_udtSites[iS].Packages[iP].Batches[iB].Type, RAWS_udtSites[iS].Packages[iP].Batches[iB].Price );
				}}
			}}

			for (var iP=0; iP<RAWS_udtSites[iS].Products.length; iP++) {
				switch (RAWS_udtSites[iS].Products[iP].Type) {
				case 'RA PACKAGE' :
					PS = RA_CtrlWin.RA.Packages[ RAWS_udtSites[iS].Products[iP].ProductID ];

					// Updated 20100205, Chad: Moved .Description to .Data param
					P = RA_CtrlWin.RA.AddProduct( RAWS_udtSites[iS].Products[iP].ProductID, RAWS_udtSites[iS].Products[iP].Title, RAWS_udtSites[iS].Products[iP].Type, PS, RAWS_udtSites[iS].Products[iP].Data );
					P.Tag = RAWS_udtSites[iS].Products[iP].Tag;
					P.LearnMoreLink = RAWS_udtSites[iS].Products[iP].LearnMoreLink;
//					P.Description = RAWS_udtSites[iS].Products[iP].Description;

					if (P.TypeObj) {
					for (var isite in P.TypeObj.SiteAssignments) {if (P.TypeObj.SiteAssignments.hasOwnProperty(isite)) {
						var tmpID = P.TypeObj.SiteAssignments[isite].Site.ID;
						var x = RA_CtrlWin.RA.AddProduct( tmpID, P.TypeObj.SiteAssignments[isite].Site.Description, 'RA PACKAGE SITE', P.TypeObj.SiteAssignments[isite].Site, P.Data );
//alert( P.TypeObj.SiteAssignments[isite].Description +' - '+ x.Title );
						x.Tag = P.Tag;
						x.LearnMoreLink = P.LearnMoreLink;
					// Updated 20100205, Chad: Moved .Description to .Data param
//						x.Description = P.Description;
					}}
					}

cstr += '.ProductID: '+ RAWS_udtSites[iS].Products[iP].ProductID +'\n';
cstr += 'PS: '+ PS +'\n';
cstr += 'P: '+ P +'\n';
cstr += 'P.TypeObj: '+ P.TypeObj +'\n';
cstr += '.Data: '+ RAWS_udtSites[iS].Products[iP].Data +'\n';
cstr += 'P.Data: '+ P.Data +'\n';
//alert(cstr);
					if (P.TypeObj) {
					for (var ibatch in P.TypeObj.Batches) {if (P.TypeObj.Batches.hasOwnProperty(ibatch)) {
						if (!P.TypeObj.Batches[ibatch].Suspended && P.TypeObj.Batches[ibatch].Type == 'eCommerce') {
							B = P.TypeObj.Batches[ibatch];
							var ExpType = '';
							var ExpValue;
							if (B.RelativeExpiration) {
								ExpType = 'Relative';
								ExpValue = B.RelativeExpiration;
							} else if (B.AbsoluteExpiration) {
								ExpType = 'Absolute';
								ExpValue = B.AbsoluteExpiration;
							}
							var rcartitem = RA_CtrlWin.RA.Cart.NewItem(P, B.ID, B.Price, P.TypeObj.ID, '30', ExpType, ExpValue);
						}

					}}
					}

					break;
				case 'RA SITE' :
					PS = RA_CtrlWin.RA.Sites[ RAWS_udtSites[iS].Products[iP].ProductID ];

					// Updated 20100205, Chad: Moved .Description to .Data param
					P = RA_CtrlWin.RA.AddProduct( RAWS_udtSites[iS].Products[iP].ProductID, RAWS_udtSites[iS].Products[iP].Title, RAWS_udtSites[iS].Products[iP].Type, PS, RAWS_udtSites[iS].Products[iP].Data );
					P.Tag = RAWS_udtSites[iS].Products[iP].Tag;
					P.LearnMoreLink = RAWS_udtSites[iS].Products[iP].LearnMoreLink;
//					P.Description = RAWS_udtSites[iS].Products[iP].Description;
					P.Data = RAWS_udtSites[iS].Products[iP].Data;
//					P = RA_CtrlWin.RA.Products[ RAWS_udtSites[iS].Products[iP].ProductID ];

cstr = '';
cstr += '.ProductID: '+ RAWS_udtSites[iS].Products[iP].ProductID +'\n';
cstr += 'PS: '+ PS +'\n';
cstr += 'P: '+ P +'\n';
cstr += 'P.TypeObj: '+ P.TypeObj +'\n';
cstr += '.Data: '+ RAWS_udtSites[iS].Products[iP].Data +'\n';
cstr += 'P.Data: '+ P.Data +'\n';
if (RA_CtrlWin.RA.dev_check('Product.Data')) alert(cstr);

					//Add CartItems for this Product
if (RA_CtrlWin.RA.dev_check('cart')) {
	P.TypeObj.PackageAssignments = new Object();
	alert(P.TypeObj.PackageAssignments);
}
					if (P.TypeObj) {
					for (var ipack in P.TypeObj.PackageAssignments) {if (P.TypeObj.PackageAssignments.hasOwnProperty(ipack)) {
						for (var ibatch in P.TypeObj.PackageAssignments[ipack].Package.Batches) {if (P.TypeObj.PackageAssignments[ipack].Package.Batches.hasOwnProperty(ibatch)) {
							if (!P.TypeObj.PackageAssignments[ipack].Package.Batches[ibatch].Suspended && P.TypeObj.PackageAssignments[ipack].Package.Batches[ibatch].Type == 'eCommerce') {
								B = P.TypeObj.PackageAssignments[ipack].Package.Batches[ibatch];
								var ExpType = '';
								var ExpValue;
								if (B.RelativeExpiration) {
									ExpType = 'Relative';
									ExpValue = B.RelativeExpiration;
								} else if (B.AbsoluteExpiration) {
									ExpType = 'Absolute';
									ExpValue = B.AbsoluteExpiration;
								}
								var rcartitem = RA_CtrlWin.RA.Cart.NewItem(P, B.ID, B.Price, P.TypeObj.PackageAssignments[ipack].Package.ID, P.TypeObj.PackageAssignments[ipack].LevelOfAccess, ExpType, ExpValue);
							}

						}}
					}}
					}

					break;
				case 'RA CONTENT' :
					PS = RA_CtrlWin.RA.Sites[ RAWS_udtSites[iS].Products[iP].ProductID ];

					// Updated 20100205, Chad: Moved .Description to .Data param
					P = RA_CtrlWin.RA.AddProduct( RAWS_udtSites[iS].Products[iP].ProductID, RAWS_udtSites[iS].Products[iP].Title, RAWS_udtSites[iS].Products[iP].Type, PS, RAWS_udtSites[iS].Products[iP].Data );
					P.Tag = RAWS_udtSites[iS].Products[iP].Tag;
					P.LearnMoreLink = RAWS_udtSites[iS].Products[iP].LearnMoreLink;
//					P.Description = RAWS_udtSites[iS].Products[iP].Description;
					P.Data = RAWS_udtSites[iS].Products[iP].Data;
//					P = RA_CtrlWin.RA.Products[ RAWS_udtSites[iS].Products[iP].ProductID ];

cstr += '.ProductID: '+ RAWS_udtSites[iS].Products[iP].ProductID +'\n';
cstr += 'PS: '+ PS +'\n';
cstr += 'P: '+ P +'\n';
cstr += 'P.TypeObj: '+ P.TypeObj +'\n';
cstr += '.Data: '+ RAWS_udtSites[iS].Products[iP].Data +'\n';
cstr += 'P.Data: '+ P.Data +'\n';

					//Add CartItems for this Product
if (RA_CtrlWin.RA.dev_check('cart')) {
	P.TypeObj.PackageAssignments = new Object();
	alert(P.TypeObj.PackageAssignments);
}
					if (P.TypeObj) {
					for (var ipack in P.TypeObj.PackageAssignments) {if (P.TypeObj.PackageAssignments.hasOwnProperty(ipack)) {
						for (var ibatch in P.TypeObj.PackageAssignments[ipack].Package.Batches) {if (P.TypeObj.PackageAssignments[ipack].Package.Batches.hasOwnProperty(ibatch)) {
							if (!P.TypeObj.PackageAssignments[ipack].Package.Batches[ibatch].Suspended && P.TypeObj.PackageAssignments[ipack].Package.Batches[ibatch].Type == 'eCommerce') {
								B = P.TypeObj.PackageAssignments[ipack].Package.Batches[ibatch];
								var ExpType = '';
								var ExpValue;
								if (B.RelativeExpiration) {
									ExpType = 'Relative';
									ExpValue = B.RelativeExpiration;
								} else if (B.AbsoluteExpiration) {
									ExpType = 'Absolute';
									ExpValue = B.AbsoluteExpiration;
								}
								var rcartitem = RA_CtrlWin.RA.Cart.NewItem(P, B.ID, B.Price, P.TypeObj.PackageAssignments[ipack].Package.ID, P.TypeObj.PackageAssignments[ipack].LevelOfAccess, ExpType, ExpValue);
							}

						}}
					}}
					}

					break;
				default :
				}
			}

		}}
//alert(msg2);
msg += 'returning to temp fn<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
		try{RA_tempFn();}catch(e){}
//alert('current site = '+ RA_CtrlWin.RA.CurrentSite.ID);
	} else {
msg += 'RA.InitCurrentSite_2 ERROR:('+ RA_tempSiteBaseURLs +') => ('+ RAWS_error +')<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
alert( 'RA.InitCurrentSite_2 ERROR:('+ RA_tempSiteBaseURLs +') => ('+ RAWS_error +')');
	}
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.InitCurrentUser = function (fn) {
	//alert('InitCurrentUser -- RA_CtrlWin.RA.RAif.inited='+RA_CtrlWin.RA.RAif.inited);
var msg = '';
msg += 'RA.InitCurrentUser<br/>'
//if (RA_CtrlWin.RA.dev_check()) alert('RA.InitCurrentUser: '+ RA_CtrlWin.RA.CurrentUser +' - '+ RA_CtrlWin.RA.CurrentSite);
	RA_tempFn = function () {};
	if (fn) RA_tempFn = fn;
	if (RA_CtrlWin.RA.CurrentUser != null && RA_CtrlWin.RA.CurrentSite != null) {
if (RA_CtrlWin.RA.dev_check()) alert('RA.InitCurrentUser: '+ RA_CtrlWin.RA.CurrentUser.ID);
msg += 'DOING SITE LOGIN<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
		RAWS_WaitFor( RA_CtrlWin.RA.InitCurrentUser_2_go );
		RAWS1_SiteLogin( new Array( 'iUserID='+ RA_CtrlWin.RA.CurrentUser.ID, 'iSiteID='+ RA_CtrlWin.RA.CurrentSite.ID, 'sIPAddr='+ RA_CtrlWin.RA.CurrentUser.IP ) );
	} else {
msg += 'CurrentUser IS NULL<br/>'
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
		RA_CtrlWin.RA.InitCurrentUser_FINISH();
	}
}
RAObj.prototype.InitCurrentUser_2_go = function () {
	RA_CtrlWin.RA.InitCurrentUser_2();
}
RAObj.prototype.InitCurrentUser_2 = function () {
//alert('RA.InitCurrentUser_2');
	if (RAWS_error=='') {
		RA_CtrlWin.RA.AddSiteLogin('',RA_CtrlWin.RA.CurrentUser,RA_CtrlWin.RA.CurrentSite,'',RA_CtrlWin.RAWS_sInstructorEmail,0,RA_CtrlWin.RA.CurrentUser.IP );
		RA_CtrlWin.RA.InitCurrentUser_FINISH();
	} else {
alert( 'RA.InitCurrentUser_2 ERROR:('+ RAWS_error +')' );
		return false;
	}
}
RAObj.prototype.InitCurrentUser_FINISH = function () {
//alert('RA.InitCurrentUser_FINISH');
var msg = '';
msg += 'RA.InitCurrentUser_FINISH<br/>'
	this.SetClassUsing();
	var RAXSsl = $.cookie('RAXSsl');
	RA_CtrlWin.RA.SaveSession();
	if (RAXSsl == 2)
	{//HANDLE RELOAD FOR APP???
		RA_CtrlWin.RA.RAWS.UpdateServer();

		$.cookie('RAXSsl',1, { path: RA_CtrlWin.RA.CookiePath });
	}
RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
	try{RA_tempFn();}catch(e){}
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.InitSites = function ( arrSiteIDs, fn) {
//alert('RAObj.InitSites : '+ arrSiteIDs.length);
//alert('RAObj.InitSites : '+ arrSiteIDs[0]);
	if (!arrSiteIDs) return;
	if (arrSiteIDs.length<1) return;

	RA_tempFn = function () {};
	if (fn) RA_tempFn = fn;

	RAWS_WaitFor( RA_CtrlWin.RA.InitSites_2_go );
	var str = '';
	for (var i=0; i<arrSiteIDs.length; i++) {
		if (i>0) str += ',';
		str += arrSiteIDs[i];
	}
	RAWS3_GetSitesFromSiteIDs( new Array( 'sSiteIDs='+str ) );
}
RAObj.prototype.InitSites_2_go = function () {
	RA_CtrlWin.RA.InitSites_2();
}
RAObj.prototype.InitSites_2 = function () {
//alert('RA.InitSites_2' );
	if (RAWS_udtSites && RAWS_error=='') {
		var S, P, SA, B;
		for (var iS in RAWS_udtSites) {if (RAWS_udtSites.hasOwnProperty(iS)) {
			S = RA_CtrlWin.RA.AddSite( RAWS_udtSites[iS].SiteID, RAWS_udtSites[iS].BaseURL, '' );
			for (var iP in RAWS_udtSites[iS].Packages) {if (RAWS_udtSites[iS].Packages.hasOwnProperty(iP)) {
				P = RA_CtrlWin.RA.AddPackage( RAWS_udtSites[iS].Packages[iP].PackageID, RAWS_udtSites[iS].Packages[iP].Description, RAWS_udtSites[iS].Packages[iP].Type );
				SA = RA_CtrlWin.RA.AddSiteAssignment( RAWS_udtSites[iS].Packages[iP].SiteAssignmentID, P, S, RAWS_udtSites[iS].Packages[iP].LevelOfAccess );
				for (var iB in RAWS_udtSites[iS].Packages[iP].Batches) {if (RAWS_udtSites[iS].Packages[iP].Batches.hasOwnProperty(iB)) {
					B = RA_CtrlWin.RA.AddBatch( RAWS_udtSites[iS].Packages[iP].Batches[iB].BatchID, RAWS_udtSites[iS].Packages[iP].Batches[iB].Description, P, RAWS_udtSites[iS].Packages[iP].Batches[iB].UseByDate, RAWS_udtSites[iS].Packages[iP].Batches[iB].RelativeExpiration, RAWS_udtSites[iS].Packages[iP].Batches[iB].AbsoluteExpiration, RAWS_udtSites[iS].Packages[iP].Batches[iB].Suspended, RAWS_udtSites[iS].Packages[iP].Batches[iB].Type, RAWS_udtSites[iS].Packages[iP].Batches[iB].Price );
				}}
			}}
		}}
		try{RA_tempFn();}catch(e){}
	} else {
alert( 'RA.InitSites_2 ERROR:('+ RAWS_error +')');
	}
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

RAObj.prototype.AddProduct = function(
	ID, 
	Title, 
	Type, 
	TypeObj 
) {
	if ( ! this.Products[ID] ) {
		this.Products[ID] = new RAProductObj(this, ID, Title, Type, TypeObj );
	} else {
		this.Products[ID].Update( ID, Title, Type, TypeObj );
	}
	return this.Products[ID];
}

RAObj.prototype.AddSite = function(
	ID,
	BaseURL,
	Description
) {
	if ( ! this.Sites[ID] ) {
		this.Sites[ID] = new RASiteObj(this, ID, BaseURL, Description );
	} else {
		this.Sites[ID].Update( ID, BaseURL, Description );
	}
	return this.Sites[ID];
}

RAObj.prototype.AddPackage = function(
	ID,
	Description,
	Type
) {
	if ( ! this.Packages[ID] ) {
//alert('add package = '+ ID);
		this.Packages[ID] = new RAPackageObj(this, ID, Description, Type );
	} else {
//alert('update package = '+ ID);
		this.Packages[ID].Update( ID, Description, Type );
	}
	return this.Packages[ID];
}

RAObj.prototype.AddBatch = function(
	ID,
	Description,
	Package,
	UseByDate,
	RelativeExpiration,
	AbsoluteExpiration,
	Suspended,
	Type,
	Price
) {
	if ( ! this.Batches[ID] ) {
		this.Batches[ID] = new RABatchObj(this, ID, Description, Package, UseByDate, RelativeExpiration, AbsoluteExpiration, Suspended, Type, Price );
	} else {
		this.Batches[ID].Update( ID, Description, Package, UseByDate, RelativeExpiration, AbsoluteExpiration, Suspended, Type, Price );
	}
	return this.Batches[ID];
}

RAObj.prototype.AddSiteAssignment = function(
	ID,
	Package,
	Site,
	LevelOfAccess
) {
	if ( ! this.SiteAssignments[Site.ID+'_'+Package.ID] ) {
		this.SiteAssignments[Site.ID+'_'+Package.ID] = new RASiteAssignmentObj(this, ID, Package, Site, LevelOfAccess );
	} else {
		this.SiteAssignments[Site.ID+'_'+Package.ID].Update( ID, Package, Site, LevelOfAccess );
	}
	return this.SiteAssignments[Site.ID+'_'+Package.ID];
}

RAObj.prototype.AddUser = function(
	ID,
	Email,
	FName,
	LName,
	PasswordHint,
	MailPreference,
	OptInEmail,
	RememberMe,
	ClassPrompt,
	Classes_ct
) {
//alert('AddUser :: '+ ID +' :: '+ ClassPrompt);
	if (!Classes_ct) Classes_ct = 0
	if ( ! this.Users[ID] ) {
		this.Users[ID] = new RAUserObj(this, ID, Email, FName, LName, PasswordHint, MailPreference, OptInEmail, RememberMe, ClassPrompt, Classes_ct );
	} else {
		this.Users[ID].Update( ID, Email, FName, LName, PasswordHint, MailPreference, OptInEmail, RememberMe, ClassPrompt, Classes_ct );
	}
	return this.Users[ID];
}

RAObj.prototype.AddSiteLogin = function(
	ID,
	User,
	Site,
	LastLogin,
	InstructorEmail,
	SiteAccessRevoked,
	LoggedOn
) {
	try {
		if ( ! this.SiteLogins[User.ID+'_'+Site.ID] ) {
			this.SiteLogins[User.ID+'_'+Site.ID] = new RASiteLoginObj(this, ID, User, Site, LastLogin, InstructorEmail, SiteAccessRevoked, LoggedOn );
		} else {
			this.SiteLogins[User.ID+'_'+Site.ID].Update( ID, User, Site, LastLogin, InstructorEmail, SiteAccessRevoked, LoggedOn );
		}
		return this.SiteLogins[User.ID+'_'+Site.ID];
	} catch(e) {
	}
}

RAObj.prototype.AddUserAssignment = function(
	ID,
	User,
	Package,
	AccessID,
	Expiration
) {
	if ( ! this.UserAssignments[User.ID+'_'+Package.ID] ) {
		this.UserAssignments[User.ID+'_'+Package.ID] = new RAUserAssignmentObj(this, ID, User, Package, AccessID, Expiration );
	} else {
		this.UserAssignments[User.ID+'_'+Package.ID].Update( ID, User, Package, AccessID, Expiration );
	}
	return this.UserAssignments[User.ID+'_'+Package.ID];
}

RAObj.prototype.AddClass = function(
	ID,
	Name,
	Desc,
	Code,
	Exiration,
	Creator_User,
	StartDate,
	EndDate,
	EmailScores,
	RecordStatus
) {
	if ( ! this.Classes[ID] ) {
		this.Classes[ID] = new RAClassObj(this, ID, Name, Desc, Code, Exiration, Creator_User, StartDate, EndDate, EmailScores, RecordStatus );
	} else {
		this.Classes[ID].Update( ID, Name, Desc, Code, Exiration, Creator_User, StartDate, EndDate, EmailScores, RecordStatus );
	}
	return this.Classes[ID];
}

RAObj.prototype.AddClassLogin = function(
	User,
	Class,
	AccessRevoked,
	LastLogin
) {
	if ( ! this.ClassLogins[User.ID+'_'+Class.ID] ) {
		this.ClassLogins[User.ID+'_'+Class.ID] = new RAClassLoginObj(this, User, Class, AccessRevoked, LastLogin );
	} else {
		this.ClassLogins[User.ID+'_'+Class.ID].Update( User, Class, AccessRevoked, LastLogin );
	}
	return this.ClassLogins[User.ID+'_'+Class.ID];
}





// **********************************************************************************
// **********************************************************************************

RAObj.prototype.SaveSession = function () {
var msg = '';
msg += 'RA.SaveSession<br/>'
//alert('RA.SaveSession');

	var errmsg = '';
	var msg = '';
	var RAJSON_strXS = '';
	var RAJSON_strXSL = '';
	var RAJSON_strUs = '';
	var RAJSON_strSLs = '';
	var RAJSON_strUAs = '';
	var RAJSON_arr_strCs = new Array();
	var RAJSON_strCLs = '';

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// CURRENT USER
msg += 'CURRENT USER<br/>'
	if (RA_CtrlWin.RA.CurrentUser != null)
	{
		$.cookie('RAu',RA_CtrlWin.RA.CurrentUser.ID, { path: RA_CtrlWin.RA.CookiePath });
	}
	else
	{
		$.cookie('RAu','', { path: RA_CtrlWin.RA.CookiePath });
		$.cookie('RASL','', { path: RA_CtrlWin.RA.CookiePath });
	}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// USERS
msg += 'USERS<br/>'
	try {

		var tmpObj = new Object();
		for (var i in RA_CtrlWin.RA.Users)
		{if (RA_CtrlWin.RA.Users.hasOwnProperty(i)){
			tmpObj[i] = RA_CtrlWin.RA.Users[i].toCookieEntity();
		}}
		RAJSON_strUs = JSON.stringify( tmpObj, RA_CtrlWin.RA.stringifyReplacer );
msg += '<div style="color:blue">RAJSON_strUs';
msg += ' - '+ RAJSON_strUs +'';
msg += '</div>';

	} catch(e) {
msg += '<span style="color:red;font-weight:bold">ERROR:</span> '+e.lineNumber+' --- '+e.message+'<br/>'
		this.recordError(e);
	}

	$.cookie('RAUs',RAJSON_strUs, { path: RA_CtrlWin.RA.CookiePath });

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// SITE LOGINS
msg += 'SITE LOGINS<br/>'
	try {

		RAJSON_strXS = JSON.stringify( RA_CtrlWin.RA.CurrentSite, RA_CtrlWin.RA.stringifyReplacer );
msg += '<div style="color:blue">RAJSON_strXS';
msg += ' - '+ RAJSON_strXS +'';
msg += '</div>';
		if (this.CurrentUser != null && this.CurrentSite != null)
		{
			msg += 'checking current user/site SL [ '+ this.CurrentUser.ID+'_'+this.CurrentSite.ID+' ] = '+ this.SiteLogins[this.CurrentUser.ID+'_'+this.CurrentSite.ID] +'<br/>';
			if (this.SiteLogins[this.CurrentUser.ID+'_'+this.CurrentSite.ID] )
			{
				msg += 'matched current user/site SL<br/>';
				var tmpObj = RA_CtrlWin.RA.SiteLogins[this.CurrentUser.ID+'_'+this.CurrentSite.ID].toCookieEntity();
				RAJSON_strXSL = JSON.stringify( tmpObj, RA_CtrlWin.RA.stringifyReplacer );
msg += '<div style="color:blue">RAJSON_strXSL';
msg += ' - '+ RAJSON_strXSL +'';
msg += '</div>';
			}
		} else {
			msg += 'no current user/site SLs<br/>';
		}
		var tmpObj = new Object();
		for (var i in RA_CtrlWin.RA.SiteLogins)
		{if (RA_CtrlWin.RA.SiteLogins.hasOwnProperty(i)){
			tmpObj[i] = RA_CtrlWin.RA.SiteLogins[i].toCookieEntity();
		}}
		RAJSON_strSLs = JSON.stringify( tmpObj, RA_CtrlWin.RA.stringifyReplacer );
msg += '<div style="color:blue">RAJSON_strSLs';
msg += ' - '+ RAJSON_strSLs +'';
msg += '</div>';

		msg += 'SLs RAJSON_strSLs.length == '+ RAJSON_strSLs.length +'<br/>';

	} catch(e) {
msg += '<span style="color:red;font-weight:bold">ERROR:</span> '+e.lineNumber+' --- '+e.message+'<br/>'
		this.recordError(e);
	}

	if (RAJSON_strXS!='')
	{
		msg += '<b>FINAL RAS =</b> '+RAJSON_strXS+'<br/>';
		$.cookie('RAS',RAJSON_strXS, { path: RA_CtrlWin.RA.CookiePath });
	}
	if (RAJSON_strXSL!='')
	{
		msg += '<b>FINAL RASL =</b> '+RAJSON_strXSL+'<br/>';
		$.cookie('RASL',RAJSON_strXSL, { path: RA_CtrlWin.RA.CookiePath });
	}
	$.cookie('RASLs',RAJSON_strSLs, { path: RA_CtrlWin.RA.CookiePath });

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// USER ASSIGNMENTS
msg += 'USER ASSIGNMENTS<br/>'
	try {

		var tmpObj = new Object();
		for (var i in RA_CtrlWin.RA.UserAssignments)
		{if (RA_CtrlWin.RA.UserAssignments.hasOwnProperty(i)){
			tmpObj[i] = RA_CtrlWin.RA.UserAssignments[i].toCookieEntity();
		}}
		RAJSON_strUAs = JSON.stringify( tmpObj, RA_CtrlWin.RA.stringifyReplacer );
msg += '<div style="color:blue">RAJSON_strUAs';
msg += ' - '+ RAJSON_strUAs +'';
msg += '</div>';

	} catch(e) {
msg += '<span style="color:red;font-weight:bold">ERROR:</span> '+e.lineNumber+' --- '+e.message+'<br/>'
		this.recordError(e);
	}

	$.cookie('RAUAs',RAJSON_strUAs, { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RALoA',RA_CtrlWin.RAWS_iLevelOfAccess);

if (true)
{
// removing this code, instead will drop one cookie only for CurrentUser.ClassUsing

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// CLASSES

if(RA_CtrlWin.RA.UsingClasses)
{
msg += 'CLASSES<br/>'
	var RACct = 0
	for (var iClass in RA_CtrlWin.RA.Classes) {if (RA_CtrlWin.RA.Classes.hasOwnProperty(iClass)) {
		try {

	        var tmpObj = RA_CtrlWin.RA.Classes[iClass].toCookieEntity();
	        RAJSON_arr_strCs[RACct] = JSON.stringify( tmpObj, RA_CtrlWin.RA.stringifyReplacer );

			msg += 'C['+iClass+'] RAJSON_strCs.length == '+ RAJSON_arr_strCs[RACct].length +'<br/>';

		} catch(e) {
msg += '<span style="color:red;font-weight:bold">ERROR:</span> '+e.lineNumber+' --- '+e.message+'<br/>'
			this.recordError(e);
		}

		$.cookie('RAC'+RACct, RAJSON_arr_strCs[RACct], { path: RA_CtrlWin.RA.CookiePath });
		RACct++;
	}}
msg += '<div style="color:blue">RACct';
msg += ' - '+ RACct +'';
msg += '</div>';
	$.cookie('RACct', RACct, { path: RA_CtrlWin.RA.CookiePath });
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// CLASS LOGINS
if(RA_CtrlWin.RA.UsingClasses)
{
msg += 'CLASS LOGINS<br/>'
	try {

		var tmpObj = new Object();
		for (var i in RA_CtrlWin.RA.ClassLogins)
		{if (RA_CtrlWin.RA.ClassLogins.hasOwnProperty(i)){
			tmpObj[i] = RA_CtrlWin.RA.ClassLogins[i].toCookieEntity();
		}}
        RAJSON_strCLs = JSON.stringify( tmpObj, RA_CtrlWin.RA.stringifyReplacer );

		msg += 'CLs RAJSON_strCLs.length == '+ RAJSON_strCLs.length +'<br/>';

	} catch(e) {
msg += '<span style="color:red;font-weight:bold">ERROR:</span> '+e.lineNumber+' --- '+e.message+'<br/>'
		this.recordError(e);
	}

	$.cookie('RACLs',RAJSON_strCLs, { path: RA_CtrlWin.RA.CookiePath });
}

}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// SET SAVED
	$.cookie('RAXSsl','1', { path: RA_CtrlWin.RA.CookiePath });

RA_CtrlWin.RA.logDebug( msg );
RA_CtrlWin.RA.dumpDebug();
}

// **********************************************************************************

RAObj.prototype.LoadSession = function () {
//alert('RA.LoadSession');
	var msg = 'RA.LoadSession<ul>';
	var RAJSON_obj = null;

	var RAu = $.cookie('RAu');
	var RAJSON_strUs = $.cookie('RAUs');
	var RAJSON_strSLs = $.cookie('RASLs');
	var RAJSON_strUAs = $.cookie('RAUAs');
	
if(RA_CtrlWin.RA.UsingClasses)
{
	var RACct;
	msg += '<br/>RACct = '+ $.cookie('RACct');
	try {
		RACct = new Number( $.cookie('RACct') );
	}catch(e){
		RACct = 0
	}
	if (isNaN(RACct)) RACct = 0;
	var RAJSON_arr_strCs = new Array();
	for (var i=0; i<RACct; i++){
		RAJSON_arr_strCs[i] = $.cookie('RAC'+i);
	}
	var RAJSON_strCLs = $.cookie('RACLs');
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// USERS
	try {
//		RAJSON_obj = RAJSON_strUs.parseJSON();
		RAJSON_obj = JSON.parse( RAJSON_strUs, RA_CtrlWin.RA.parseReviver );
	} catch(e) {
		this.recordError(e);
	}
	try {
		msg += '<hr/>RAJSON_objUs ('+ RAJSON_obj +')<br/>';
		for (var i in RAJSON_obj) {if (RAJSON_obj.hasOwnProperty(i)) {
			msg += 'User('+ RAJSON_obj[i].ID +') :: ';
			msg += RA_CtrlWin.RA.AddUser( RAJSON_obj[i].ID, RAJSON_obj[i].e, RAJSON_obj[i].fn, RAJSON_obj[i].ln, RAJSON_obj[i].ph, RAJSON_obj[i].mp, RAJSON_obj[i].oi, RAJSON_obj[i].rm, RAJSON_obj[i].cp, RAJSON_obj[i].cct, RAJSON_obj[i].gid );
			msg += '<br/>';
		}}
	} catch(e) {
		this.recordError(e);
	}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// CURRENT USER

	msg += '<hr/>RA.CurrentUser :: ';
	for (var i in RA_CtrlWin.RA.Users) {if (RA_CtrlWin.RA.Users.hasOwnProperty(i)) {
		if (RA_CtrlWin.RA.Users[i].ID == RAu) {
			RA_CtrlWin.RA.CurrentUser = RA_CtrlWin.RA.Users[i];
		}
	}}
	msg += RA_CtrlWin.RA.CurrentUser +'<br/>';


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// SITE LOGINS
	try {
//		RAJSON_obj = RAJSON_strSLs.parseJSON();
		RAJSON_obj = JSON.parse( RAJSON_strSLs, RA_CtrlWin.RA.parseReviver );
	} catch(e) {
		this.recordError(e);
	}
	try {
		msg += '<hr/>RAJSON_objSLs ('+ RAJSON_obj +')<br/>';
		for (var i in RAJSON_obj) {if (RAJSON_obj.hasOwnProperty(i)) {
			msg += 'SiteLogin('+ RAJSON_obj[i].ID +') :: ';
			msg += RA_CtrlWin.RA.AddSiteLogin( RAJSON_obj[i].ID, RA_CtrlWin.RA.Users[RAJSON_obj[i].UID], RA_CtrlWin.RA.Sites[RAJSON_obj[i].SID], RAJSON_obj[i].ll, RAJSON_obj[i].ie, RAJSON_obj[i].sar, RAJSON_obj[i].lo );
			msg += '<br/>';
		}}
	} catch(e) {
		this.recordError(e);
	}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// USER ASSIGNMENTS
	try {
//		RAJSON_obj = RAJSON_strUAs.parseJSON();
		RAJSON_obj = JSON.parse( RAJSON_strUAs, RA_CtrlWin.RA.parseReviver );
	} catch(e) {
		this.recordError(e);
	}
	try {
		msg += '<hr/>RAJSON_objUAs ('+ RAJSON_obj +')<br/>';
		for (var i in RAJSON_obj) {if (RAJSON_obj.hasOwnProperty(i)) {
			msg += 'UserAssignment('+ RAJSON_obj[i].ID +') :: ';
			msg += RA_CtrlWin.RA.AddUserAssignment( RAJSON_obj[i].ID, RA_CtrlWin.RA.Users[RAJSON_obj[i].UID], RA_CtrlWin.RA.Packages[RAJSON_obj[i].PID], RAJSON_obj[i].AID, RAJSON_obj[i].ex );
			msg += '<br/>';
		}}
	} catch(e) {
		this.recordError(e);
	}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// CLASSES
if(RA_CtrlWin.RA.UsingClasses)
{
	msg += '<hr/>RAJSON_objCs<br/>';
	for (var i=0; i<RAJSON_arr_strCs.length; i++) {
		try {
//			RAJSON_obj = RAJSON_arr_strCs[i].parseJSON();
			RAJSON_obj = JSON.parse( RAJSON_arr_strCs[i], RA_CtrlWin.RA.parseReviver );
		} catch(e) {
			this.recordError(e);
		}
		try {
			msg += 'RAJSON_objCs ('+ i +' :: '+ RAJSON_obj +' :: '+ RAJSON_obj.n +')<br/>';
			msg += 'Class('+ RAJSON_obj.ID +') :: ';
			msg += RA_CtrlWin.RA.AddClass( RAJSON_obj.ID, RAJSON_obj.n, RAJSON_obj.d, RAJSON_obj.c, RAJSON_obj.e, RA_CtrlWin.RA.Users[RAJSON_obj.cr.ID], RAJSON_obj.sd, RAJSON_obj.ed, RAJSON_obj.es, RAJSON_obj.rs );
			msg += '<br/>';
		} catch(e) {
			this.recordError(e);
		}
	}
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// CLASSES LOGINS
if(RA_CtrlWin.RA.UsingClasses)
{
	try {
//		RAJSON_obj = RAJSON_strCLs.parseJSON();
		RAJSON_obj = JSON.parse( RAJSON_strCLs, RA_CtrlWin.RA.parseReviver );
	} catch(e) {
		this.recordError(e);
	}
	try {
		msg += '<hr/>RAJSON_objCLs ('+ RAJSON_obj +')<br/>';
		for (var i in RAJSON_obj) {if (RAJSON_obj.hasOwnProperty(i)) {
			msg += 'ClassLogin('+ i +') :: ';
			msg += RA_CtrlWin.RA.AddClassLogin( RA_CtrlWin.RA.Users[RAJSON_obj[i].u.ID], RA_CtrlWin.RA.Classes[RAJSON_obj[i].c.ID], RAJSON_obj[i].ar, RAJSON_obj[i].ll );
			msg += '<br/>';
		}}
	} catch(e) {
		this.recordError(e);
	}

	msg += '</ul>';
	this.logDebug(msg);
}
}





RAObj.prototype.ClearUser = function(
) {

	$.cookie('RAu', '', { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RASL', '', { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RAUs', '', { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RAS', '', { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RASL', '', { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RASLs', '', { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RAUAs', '', { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RALoA', '', { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RALoA', '');
	var RACct = 0
	for (var iClass in RA_CtrlWin.RA.Classes) {if (RA_CtrlWin.RA.Classes.hasOwnProperty(iClass)) {
		$.cookie('RAC'+RACct, '', { path: RA_CtrlWin.RA.CookiePath });
		RACct++;
	}}
	$.cookie('RACct', '', { path: RA_CtrlWin.RA.CookiePath });
	$.cookie('RACLs', '', { path: RA_CtrlWin.RA.CookiePath });
//	$.cookie('RAXSsl','1', { path: RA_CtrlWin.RA.CookiePath });

	for (var i in this.UserAssignments) {if (this.UserAssignments.hasOwnProperty(i)) {
		delete this.UserAssignments[i];
	}}

	for (var i in this.SiteLogins) {if (this.SiteLogins.hasOwnProperty(i)) {
		delete this.SiteLogins[i];
	}}

	for (var i in this.ClassLogins) {if (this.ClassLogins.hasOwnProperty(i)) {
		delete this.ClassLogins[i];
	}}

	for (var i in this.Classes) {if (this.Classes.hasOwnProperty(i)) {
		delete this.Classes[i];
	}}

	for (var i in this.Users) {if (this.Users.hasOwnProperty(i)) {
		delete this.Users[i];
	}}

	this.CurrentUser = null;

/*
	for (var i in this.SiteAssignments) {if (this.SiteAssignments.hasOwnProperty(i)) {
		if ( this.SiteAssignments[i].Site != this.CurrentSite && this.CurrentSite.AuxPackageIDs.indexOf(this.SiteAssignments[i].Package.ID) < 0 ) {
			delete this.SiteAssignments[i];
		}
	}}

	for (var i in this.Packages ) {if (this.Packages.hasOwnProperty(i)) {
		if (this.CurrentSite.AuxPackageIDs.indexOf(this.Packages[i].ID) < 0 ) {
			delete this.Packages[i];
		}
	}}

	for (var i in this.Sites) {if (this.Sites.hasOwnProperty(i)) {
		if (this.Sites[i] != this.CurrentSite) {
			delete this.Sites[i];
		}
	}}

*/

}


RAObj.prototype.SetClassUsing = function(
) {
//alert('SetClassUsing: '+ RA_CtrlWin.RA.CurrentUser);
	if (RA_CtrlWin.RA.CurrentUser != null)
	{
		var instEmail = null;
		if (this.CurrentUser.SiteLogins[this.CurrentSite.ID] != null)
		{
			instEmail = this.CurrentUser.SiteLogins[this.CurrentSite.ID].InstructorEmail;
		}
		if (instEmail != null)
		{
			//alert('b');
			for (var i in this.CurrentUser.ClassLogins){if (this.CurrentUser.ClassLogins.hasOwnProperty(i)){
				//alert('a');
		//html += '<br/>'+ this.CurrentUser.ClassLogins[i].Class.Name +' - '+ this.CurrentUser.ClassLogins[i].Class.Code;
				if ( instEmail == this.CurrentUser.ClassLogins[i].Class.Code )
				{
					//alert(i);
					this.CurrentUser.ClassUsing = this.CurrentUser.ClassLogins[i].Class;
					this.CurrentUser.SiteLogins[this.CurrentSite.ID].DefaultClassID = this.CurrentUser.ClassUsing.ID;
				}
			}}
		}
//alert('SetClassUsing DONE: '+ RA_CtrlWin.RA.CurrentUser.ClassUsing);
	}
}



RAObj.prototype.CurrentSiteAccess = function(
) {
	var highestLevel = 10;
	if ( this.CurrentUser != null && this.CurrentSite != null ) {
		highestLevel = 20;
		var CurrentUserSiteAssignments = new Array();
		for (var i in this.CurrentUser.UserAssignments) {if (this.CurrentUser.UserAssignments.hasOwnProperty(i)) {
			if (this.SiteAssignments[this.CurrentSite.ID+'_'+this.CurrentUser.UserAssignments[i].Package.ID]) {
	CurrentUserSiteAssignments[CurrentUserSiteAssignments.length] = new Object();
	CurrentUserSiteAssignments[CurrentUserSiteAssignments.length-1].LevelOfAccess = this.SiteAssignments[this.CurrentSite.ID+'_'+this.CurrentUser.UserAssignments[i].Package.ID].LevelOfAccess;
	CurrentUserSiteAssignments[CurrentUserSiteAssignments.length-1].Expiration = this.CurrentUser.UserAssignments[i].Expiration;
			}
		}}
var str = '';
str += CurrentUserSiteAssignments.length +'\n';
		var latestDate = new Date();
		var nowDate = new Date();
		for (var i=0; i<CurrentUserSiteAssignments.length; i++) {
str += CurrentUserSiteAssignments[i].LevelOfAccess +' --- '+ CurrentUserSiteAssignments[i].Expiration +'\n';
//alert(str);
			var xDt = new Date(CurrentUserSiteAssignments[i].Expiration);
			var xL = new Number(CurrentUserSiteAssignments[i].LevelOfAccess);
			if (xL > highestLevel && xDt > nowDate) {
				highestLevel = xL
			}
			if (xL >= highestLevel && xDt > latestDate) {
				latestDate = xDt;
			}
	//alert(highestLevel+' --- '+latestDate);
		}
	}
//alert('CurrentSiteAccess = '+ highestLevel);
	return highestLevel;
}

RAObj.prototype.GetLevelOfAccess_Description = function (LevelOfAccess) {
	if (LevelOfAccess >= 1000) {
		return 'ADMIN';
	} else if (LevelOfAccess >= 900) {
		return 'Production Developer';
	} else if (LevelOfAccess >= 500) {
		return 'Media Producer';
	} else if (LevelOfAccess >= 300) {
		return 'Media Editor';
	} else if (LevelOfAccess >= 90) {
		return 'Production';
	} else if (LevelOfAccess >= 80) {
		return 'Sales Rep';
	} else if (LevelOfAccess >= 70) {
		return 'Adopting Instructor';
	} else if (LevelOfAccess >= 60) {
		return 'Teaching Assistant';
	} else if (LevelOfAccess >= 50) {
		return 'Adjunct';
	} else if (LevelOfAccess >= 40) {
		return 'Instructor';
	} else if (LevelOfAccess >= 30) {
		return 'Premium Student';
	} else if (LevelOfAccess >= 20) {
		return 'Basic Student';
	} else {
		return 'Anonymous';
	}
}

RAObj.prototype.CheckUser = function(
	Level
) {
	var result = false;
	if (this.CurrentUser==null) {
		if (Level <= 10) result = true;
	} else {
		result = true;
	}
	return result;
}

RAObj.prototype.HasPackageAccess = function(
	PackageID
) {
	if ( this.CurrentUser != null ) {
		var rightNow = Date();
		for (var i in this.CurrentUser.UserAssignments) {if (this.CurrentUser.UserAssignments.hasOwnProperty(i)) {
			if ( PackageID == this.CurrentUser.UserAssignments[i].Package.ID ) {
/*
alert(this.CurrentUser.UserAssignments[i].Expiration);
alert(rightNow);
alert( this.CurrentUser.UserAssignments[i].Expiration > rightNow );
*/
				return true;
			}
		}}
	}
	return false;
}

RAObj.prototype.DisplayCoreOutput = function(
) {
	var str = '';
	str += 'ProxyType = '+ this.ProxyType +'<br/>';
	str += 'PersistentSession = '+ this.PersistentSession +'<br/>';
	str += 'CookiePath = '+ this.CookiePath +'<br/>';
	str += 'RAServerOutput = <div style="border: 2px solid blue;">'+ $('#RAServerOutput').html() +'</div><br/>';
	str += '<hr/>';
	return str;
}

RAObj.prototype.DisplayAll = function(
) {
    if (!RA_CtrlWin.RA.DisplayAllCt) RA_CtrlWin.RA.DisplayAllCt = 0;
    RA_CtrlWin.RA.DisplayAllCt++;
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
try {
	str += '<a id="RADisplayAll" href="JavaScript:void(0)" onclick="$(\'#RADisplayAll\').parent().html(RA_CtrlWin.RA.DisplayAll(\'\'));">reload '+ RA_CtrlWin.RA.DisplayAllCt +'</a><br/><br/>';
	str += '<b><nobr>Sample RAif links</nobr></b><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'dologout\')">Log out</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'login\')">Log in</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'checkemail\')">Register (student)</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'updateprofile\')">Update profile</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'emailpassword\')">Forgot password</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'quizprompt\')">Quiz instructor e-mail prompt</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'instemailprompt\')">Instructor e-mail prompt</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'classprompt\')">Class prompt</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'codeorcart\')">Code or cart</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'checkcode\')">Enter code</a><br/>';
	str += '<a href="JavaScript:RA_CtrlWin.RA.RAif.init(\'cart\')">Shopping cart</a><br/>';

	str += '<hr/>';

	str += 'RAif.state.last = '+ this.RAif.state.last +'<br/>';

	str += '<hr/>';

	str += 'IE7? = "'+ jQuery.support.isIE7 +'"';
	str += '<br/>';
/*
	try {
	str += 'RSH Safari? = "'+ RA_CtrlWin.dhtmlHistory.isSafari +'"';
	str += '<br/>';
	str += 'RSH Supported? = "'+ RA_CtrlWin.dhtmlHistory.isSupported +'"';
	str += '<br/>';
	} catch(e) {
	}
	str += '<hr />';
	var x = navigator;
	str += 'CodeName=' + x.appCodeName;
	str += '<br />';
	str += 'MinorVersion=' + x.appMinorVersion;
	str += '<br />';
	str += 'Name=' + x.appName;
	str += '<br />';
	str += 'Version=' + x.appVersion;
	str += '<br />';
	str += 'CookieEnabled=' + x.cookieEnabled;
	str += '<br />';
	str += 'CPUClass=' + x.cpuClass;
	str += '<br />';
	str += 'OnLine=' + x.onLine;
	str += '<br />';
	str += 'Platform=' + x.platform;
	str += '<br />';
	str += 'UA=' + x.userAgent;
	str += '<br />';
	str += 'BrowserLanguage=' + x.browserLanguage;
	str += '<br />';
	str += 'SystemLanguage=' + x.systemLanguage;
	str += '<br />';
	str += 'UserLanguage=' + x.userLanguage;
	str += '<br />';
*/
} catch(e) {}
	str += '<hr/>';
	str += this.DisplayCoreOutput();

	if (this.CurrentUser!=null) {
		str += 'CurrentUser.ID = '+this.CurrentUser.ID;
		str += '<br/>';
		str += 'CurrentUser.GUID = '+this.CurrentUser.GUID;
		str += '<br/>';
		str += 'CurrentUser.Email = '+this.CurrentUser.Email;
		str += '<br/>';
		str += 'CurrentUser.FName / LName = '+this.CurrentUser.FName+' '+this.CurrentUser.LName;
		str += '<br/>';
		str += 'CurrentUser CurrentSiteAccess = '+ this.CurrentSiteAccess() +' ('+ this.GetLevelOfAccess_Description(this.CurrentSiteAccess()) +')';
		str += '<br/>';
		str += 'CurrentUser.OnyxStatus = '+this.CurrentUser.OnyxStatus;
		str += '<br/>';
		str += 'CurrentUser.IP = '+this.CurrentUser.IP;
		str += '<br/>';
		str += 'CurrentUser.ClassPrompt = '+this.CurrentUser.ClassPrompt;
		str += '<br/>';
try {
		str += 'CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail = '+this.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail;
		str += '<br/>';
		str += 'CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].DefaultClassID = '+this.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].DefaultClassID;
		str += '<br/>';
} catch(e) {}
try {
		str += 'CurrentUser.ClassUsing = '+this.CurrentUser.ClassUsing;
		str += '<br/>';
} catch(e) {}
try {
		str += 'CurrentUser.ClassUsing.ID = '+this.CurrentUser.ClassUsing.ID;
		str += '<br/>';
} catch(e) {}

		str += '<br/>';
		str += '<br/>';
	} else {
		str += 'CurrentUser = '+this.CurrentUser;
		str += '<br/>';
		str += '<br/>';
	}
	if (this.CurrentSite!=null) {
		str += 'CurrentSite.ID = '+this.CurrentSite.ID;
		str += '<br/>';
		str += 'CurrentSite.BaseURL = '+this.CurrentSite.BaseURL;
		str += '<br/>';
		str += 'CurrentSite.Description = '+this.CurrentSite.Description;
		str += '<br/>';
		str += '<br/>';
	} else {
		str += 'CurrentSite = '+this.CurrentSite;
		str += '<br/>';
		str += '<br/>';
	}

	str += '<hr/><table>';
	str += '<tr><td valign="top"><b><nobr>Products</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Products) {if (this.Products.hasOwnProperty(i)) {
		str += this.Products[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr/><table>';
	str += '<tr><td valign="top"><b><nobr>Sites</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Sites) {if (this.Sites.hasOwnProperty(i)) {
		str += this.Sites[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr/><table>';
	str += '<tr><td valign="top"><b><nobr>Site Assignments</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.SiteAssignments) {if (this.SiteAssignments.hasOwnProperty(i)) {
		str += this.SiteAssignments[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr/><table>';
	str += '<tr><td valign="top"><b><nobr>Packages</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Packages) {if (this.Packages.hasOwnProperty(i)) {
		str += this.Packages[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr/><table>';
	str += '<tr><td valign="top"><b><nobr>Batches</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Batches) {if (this.Batches.hasOwnProperty(i)) {
		str += this.Batches[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr/><table>';
	str += '<tr><td valign="top"><b><nobr>Users</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Users) {if (this.Users.hasOwnProperty(i)) {
		str += this.Users[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr/><table>';
	str += '<tr><td valign="top"><b><nobr>Classes</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Classes) {if (this.Classes.hasOwnProperty(i)) {
		str += this.Classes[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr/><table>';
	str += '<tr><td valign="top"><b><nobr>Class Logins</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.ClassLogins) {if (this.ClassLogins.hasOwnProperty(i)) {
		str += this.ClassLogins[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr/>';
/*
	str += '<b>http://'+ this.RAXSURL +'/debugvars.asp ...</b>';
	str += '<br/>';
	str += '<iframe src="http://'+ this.RAXSURL +'/debugvars.asp" width="100%" height="400"></iframe>';

	str += '<hr/>';
*/
	return str;
}


// *********************************************************
// RAProductObj
// *********************************************************
// Constructor
// Update 20100205: Added Data property
//		
function RAProductObj (
	RAObj,
	ID, 
	Title,
	Type,
	TypeObj,
	Data
) {
	if (RAObj==null) return null;
	this.RA = RAObj;

	this.ID = ID;
	this.Title = Title;
	this.Type = Type;
	this.TypeObj = TypeObj;
	this.Data = Data;
}

RAProductObj.prototype.Update = function(
	ID, 
	Title,
	Type,
	TypeObj
) {
	this.ID = ID;
	this.Title = Title;
	this.Type = Type;
	this.TypeObj = TypeObj;
}

RAProductObj.prototype.DisplayAll = function(
) {
//alert('RAProductObj.prototype.DisplayAll');
	return this.DefaultDisplayAll();
}

RAProductObj.prototype.DefaultDisplayAll = function(
) {
//alert('RAProductObj.prototype.DefaultDisplayAll');
//	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>Product ID = '+ this.ID +'</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Title = </nobr></td><td valign="top">'+this.Title +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Type = </nobr></td><td valign="top">'+this.Type +'</td></tr>';
	switch (this.Type) {
		case 'RA CONTENT' :
			if (this.TypeObj) {
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">(Site Content, ID='+this.TypeObj.ID +')</td></tr>';
			} else {
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">(Site Content, ID='+this.TypeObj +')</td></tr>';
			}
		break;
		case 'RA SITE' :
			if (this.TypeObj) {
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">(Site, ID='+this.TypeObj.ID +')</td></tr>';
			} else {
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">(Site, ID='+this.TypeObj +')</td></tr>';
			}
		break;
		case 'RA PACKAGE SITE' :
			if (this.TypeObj) {
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">(Site, ID='+this.TypeObj.ID +')</td></tr>';
			} else {
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">(Site, ID='+this.TypeObj +')</td></tr>';
			}
		break;
		case 'RA PACKAGE' :
			if (this.TypeObj) {
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">(Site, ID='+this.TypeObj.ID +')</td></tr>';
			} else {
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">(Site, ID='+this.TypeObj +')</td></tr>';
			}
		break;
		default :
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">'+this.TypeObj +'</td></tr>';
	}
	str += '<tr><td valign="top" width="10"><nobr>Tag = </nobr></td><td valign="top">'+this.Tag +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>LearnMoreLink = </nobr></td><td valign="top">'+this.LearnMoreLink +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Data = </nobr></td><td valign="top">'+this.Data +'</td></tr>';
	for (var i in this) {if (this.hasOwnProperty(i)) {
		if (i!='RA' && i!='ID' && i!='Title' && i!='Type' && i!='TypeObj' && i!='Data' && i!='DisplayAll') {
	str += '<tr><td valign="top" width="10"><nobr>[custom] '+ i +' = </nobr></td><td valign="top">'+this[i] +'</td></tr>';
		}
	}}
	str += '</table>';
	return str;
}

RAProductObj.prototype.CurrentUserAccess = function(
) {
	var retAccess = 10;
	if ( this.RA.CurrentUser != null ) {
		retAccess = 20;
		switch (this.Type) {
			case 'RA CONTENT' :
//				var rightNow = Date();
				for (var i in this.RA.CurrentUser.UserAssignments) {if (this.RA.CurrentUser.UserAssignments.hasOwnProperty(i)) {
					if (this.TypeObj) {
					if (this.TypeObj.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ] ) {
/*
alert(this.RA.CurrentUser.UserAssignments[i].Expiration);
alert(rightNow);
alert( this.RA.CurrentUser.UserAssignments[i].Expiration > rightNow );
*/

						retAccess = this.TypeObj.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ].LevelOfAccess;

					}
					}
				}}
			break;
			case 'RA SITE' :
//				var rightNow = Date();
				for (var i in this.RA.CurrentUser.UserAssignments) {if (this.RA.CurrentUser.UserAssignments.hasOwnProperty(i)) {
					if (this.TypeObj) {
					if (this.TypeObj.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ] ) {
/*
alert(this.RA.CurrentUser.UserAssignments[i].Expiration);
alert(rightNow);
alert( this.RA.CurrentUser.UserAssignments[i].Expiration > rightNow );
*/

						retAccess = this.TypeObj.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ].LevelOfAccess;

					}
					}
				}}
			break;
			case 'RA PACKAGE SITE' :
//				var rightNow = Date();
				for (var i in this.RA.CurrentUser.UserAssignments) {if (this.RA.CurrentUser.UserAssignments.hasOwnProperty(i)) {
					if (this.TypeObj) {
					if (this.TypeObj.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ] ) {
/*
alert(this.RA.CurrentUser.UserAssignments[i].Expiration);
alert(rightNow);
alert( this.RA.CurrentUser.UserAssignments[i].Expiration > rightNow );
*/

						retAccess = this.TypeObj.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ].LevelOfAccess;

					}
					}
				}}
			break;
			case 'RA PACKAGE' :
				var premTotal = 0;
				var instTotal = 0;
				var totalCt = 0;
				if (this.TypeObj) {
				for (var k in this.TypeObj.SiteAssignments) {if (this.TypeObj.SiteAssignments.hasOwnProperty(k)) {
					totalCt++;

				for (var i in this.RA.CurrentUser.UserAssignments) {if (this.RA.CurrentUser.UserAssignments.hasOwnProperty(i)) {
//alert( this.TypeObj.ID +' == '+ this.RA.CurrentUser.UserAssignments[i].Package.ID );

				for (var j in this.RA.CurrentUser.UserAssignments[i].Package.SiteAssignments) {if (this.RA.CurrentUser.UserAssignments[i].Package.SiteAssignments.hasOwnProperty(j)) {

					if (this.TypeObj.SiteAssignments[k].Site.ID == this.RA.CurrentUser.UserAssignments[i].Package.SiteAssignments[j].Site.ID ) {
						if (this.RA.CurrentUser.UserAssignments[i].Package.SiteAssignments[j].LevelOfAccess >= 40) {
							var x = new Number( this.RA.CurrentUser.UserAssignments[i].Package.SiteAssignments[j].LevelOfAccess );
							instTotal += x;
						} else if (this.RA.CurrentUser.UserAssignments[i].Package.SiteAssignments[j].LevelOfAccess >= 30) {
							var x = new Number( this.RA.CurrentUser.UserAssignments[i].Package.SiteAssignments[j].LevelOfAccess );
							premTotal += x;
						} else {
						}
					}

				}}

				}}

				}}
				}
				if ( instTotal/totalCt >= 40) {
					retAccess = instTotal/totalCt;
				} else if ( premTotal/totalCt >= 30) {
					retAccess = premTotal/totalCt;
				}

//alert( totalCt +' - '+ premTotal +' - '+ premTotal/totalCt +' - '+ instTotal +' - '+ instTotal/totalCt +' - '+ retAccess );

			break;
			default :
		}
	}
	return retAccess;
}


// *********************************************************
// RASiteObj
// *********************************************************
// Constructor
function RASiteObj (
	RAObj,
	ID,
	BaseURL,
	Description
) {
	if (RAObj==null) return null;
	this.RA = RAObj;
	this.ID = ID;
	this.BaseURL = BaseURL;
	this.Description = Description;
	this.PackageAssignments = new Object();

	this.toCookieEntity = function() {
		var outObj = new Object();
		outObj.rat = 's';
		outObj.ID = this.ID;
		outObj.URL = this.BaseURL;
		return outObj;
	}
}

RASiteObj.prototype.CurrentUserAccess = function(
) {
	var retAccess = 10;
	if ( this.RA.CurrentUser != null ) {
		retAccess = 20;
		for (var i in this.RA.CurrentUser.UserAssignments) {if (this.RA.CurrentUser.UserAssignments.hasOwnProperty(i)) {
			if (this.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ] ) {
/*
alert(this.RA.CurrentUser.UserAssignments[i].Expiration);
alert(rightNow);
alert( this.RA.CurrentUser.UserAssignments[i].Expiration > rightNow );
*/

				retAccess = this.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ].LevelOfAccess;

			}
		}}
	}
	return retAccess;
}

RASiteObj.prototype.Update = function(
	ID,
	BaseURL,
	Description
) {
	this.ID = ID;
	this.BaseURL = BaseURL;
	this.Description = Description;

}

RASiteObj.prototype.DisplayAll = function(
) {
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>Site ID = '+this.ID +'</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>BaseURL = </nobr></td><td valign="top">'+this.BaseURL +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Description = </nobr></td><td valign="top">'+this.Description +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>PackageAssignments IDs = </nobr></td><td valign="top">';
	for (var i in this.PackageAssignments) {if (this.PackageAssignments.hasOwnProperty(i)) {
		str += i+' ';
	}}
	str += '</td></tr>';
	str += '</table>';
	return str;
}

// *********************************************************
// RAPackageObj
// *********************************************************
// Constructor
function RAPackageObj (
	RAObj,
	ID,
	Description,
	Type
) {
	if (RAObj==null) return null;
	this.RA = RAObj;

	this.ID = ID;
	this.Description = Description;
	this.Type = Type;
	this.SiteAssignments = new Object();
	this.Batches = new Object();
}

RAPackageObj.prototype.Update = function(
	ID,
	Description,
	Type
) {
	this.ID = ID;
	this.Description = Description;
	this.Type = Type;
}

RAPackageObj.prototype.DisplayAll = function(
) {
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>Package ID = '+this.ID +'</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Description = </nobr></td><td valign="top">'+this.Description +'</td>';
	str += '<tr><td valign="top" width="10"><nobr>Type = </nobr></td><td valign="top">'+this.Type +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>SiteAssignments IDs = </nobr></td><td valign="top">';
	for (var i in this.SiteAssignments) {if (this.SiteAssignments.hasOwnProperty(i)) {
		str += i+' ';
	}}
	str += '</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Batches IDs = </nobr></td><td valign="top">';
	for (var i in this.Batches) {if (this.Batches.hasOwnProperty(i)) {
		str += this.Batches[i].ID+' ';
	}}
	str += '</td></tr>';
	str += '</table>';
	return str;
}

// *********************************************************
// RASiteAssignmentObj
// *********************************************************
// Constructor
function RASiteAssignmentObj (
	RAObj,
	ID,
	Package,
	Site,
	LevelOfAccess
) {
	if (RAObj==null) return null;
	this.RA = RAObj;

	this.ID = ID;
	this.Package = Package;
	this.Site = Site;
	this.Package.SiteAssignments[this.Site.ID] = this;
	this.Site.PackageAssignments[this.Package.ID] = this;
	this.LevelOfAccess = LevelOfAccess;
}

RASiteAssignmentObj.prototype.Update = function(
	ID,
	Package,
	Site,
	LevelOfAccess
) {
	this.ID = ID;
	this.Package = Package;
	this.Site = Site;
	this.Package.SiteAssignments[this.Site.ID] = this;
	this.Site.PackageAssignments[this.Package.ID] = this;
	this.LevelOfAccess = LevelOfAccess;
}

RASiteAssignmentObj.prototype.DisplayAll = function(
) {
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>SiteAssignment</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>ID = </nobr></td><td valign="top">'+this.ID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Package ID = </nobr></td><td valign="top">'+this.Package.ID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Site ID = </nobr></td><td valign="top">'+this.Site.ID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Site LevelOfAccess = </nobr></td><td valign="top">'+this.LevelOfAccess +'</td></tr>';
	str += '</table>';
	return str;
}

// *********************************************************
// RABatchObj
// *********************************************************
// Constructor
function RABatchObj (
	RAObj,
	ID,
	Description,
	Package,
	UseByDate,
	RelativeExpiration,
	AbsoluteExpiration,
	Suspended,
	Type,
	Price
) {
	if (RAObj==null) return null;
	this.RA = RAObj;

	this.ID = ID;
	this.Description = Description;
	this.Package = Package;
	if (this.Package.Batches) this.Package.Batches[ID] = this;
	this.UseByDate = UseByDate;
	this.RelativeExpiration = RelativeExpiration;
	this.AbsoluteExpiration = AbsoluteExpiration;
	this.Suspended = Suspended;
	this.Type = Type;
	this.Price = Price;
}

RABatchObj.prototype.Update = function(
	ID,
	Description,
	Package,
	UseByDate,
	RelativeExpiration,
	AbsoluteExpiration,
	Suspended,
	Type,
	Price
) {
	if (this.ID != ID) {
		if (this.Package && this.Package != Package) {
			delete this.Package.Batches[ID];
		}
	}
	this.ID = ID;
	this.Description = Description;
	this.Package = Package;
	if (this.Package.Batches) this.Package.Batches[ID] = this;
	this.UseByDate = UseByDate;
	this.RelativeExpiration = RelativeExpiration;
	this.AbsoluteExpiration = AbsoluteExpiration;
	this.Suspended = Suspended;
	this.Type = Type;
	this.Price = Price;
}

RABatchObj.prototype.DisplayAll = function(
) {
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>Batch ID = '+this.ID +'</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Description = </nobr></td><td valign="top">'+this.Description +'</td></tr>';
	if (this.Package) { if (this.Package.hasOwnProperty('ID')) {
		str += '<tr><td valign="top" width="10"><nobr>Package ID = </nobr></td><td valign="top">'+this.Package.ID +'</td></tr>';
	} else {
		str += '<tr><td valign="top" width="10"><nobr>Package ID = </nobr></td><td valign="top">null</td></tr>';
	}}
	str += '<tr><td valign="top" width="10"><nobr>UseByDate = </nobr></td><td valign="top">'+this.UseByDate +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>RelativeExpiration = </nobr></td><td valign="top">'+this.RelativeExpiration +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>AbsoluteExpiration = </nobr></td><td valign="top">'+this.AbsoluteExpiration +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Suspended = </nobr></td><td valign="top">'+this.Suspended +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Type = </nobr></td><td valign="top">'+this.Type +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Price = </nobr></td><td valign="top">'+this.Price +'</td></tr>';
	str += '</table>';
	return str;
}

// *********************************************************
// RAUserObj
// *********************************************************
// Constructor
function RAUserObj (
	RAObj,
	ID,
	Email,
	FName,
	LName,
	PasswordHint,
	MailPreference,
	OptInEmail,
	RememberMe,
	ClassPrompt,
	Classes_ct,
	GUID
) {
//alert('RAUserObj :: '+ ID);
	if (RAObj==null) return null;
	if (!Classes_ct) Classes_ct = 0;
	this.RA = RAObj;

	this.ID = ID;
	this.Email = Email;
	this.FName = FName;
	this.LName = LName;
	this.PasswordHint = PasswordHint;
	this.MailPreference = MailPreference;
	this.OptInEmail = OptInEmail;
	this.RememberMe = (RememberMe==1) ? 1 : 0;
	this.ClassPrompt = (ClassPrompt==0) ? 0 : 1;

	this.OnyxStatus = 0;

//alert('RAUserObj :: '+ this.ClassPrompt);
	this.SiteLogins = new Object();

	this.Classes_ct = Classes_ct;
	this.ClassLogins = new Object();

	this.GUID = '';
	if (GUID) this.GUID = GUID;
	this.UserAssignments = new Object();

	this.toCookieEntity = function() {
		var outObj = new Object();
		outObj.rat = 'u';
		outObj.ID = this.ID;
		outObj.e = this.Email;
		outObj.fn = this.FName;
		outObj.ln = this.LName;
		outObj.ph = this.PasswordHint;
		outObj.mp = this.MailPreference;
		outObj.oi = this.OptInEmail;
		outObj.rm = this.RememberMe;
		outObj.os = this.OnyxStatus;
		outObj.cp = this.ClassPrompt;
		outObj.cct = this.Classes_ct;
		outObj.gid = this.GUID;
		return outObj;
	}
}

RAUserObj.prototype.Update = function(
	ID,
	Email,
	FName,
	LName,
	PasswordHint,
	MailPreference,
	OptInEmail,
	RememberMe,
	ClassPrompt,
	Classes_ct
) {
//alert('RAUserObj :: '+ ID);
	if (!Classes_ct) Classes_ct = 0
	this.ID = ID;
	this.Email = Email;
	this.FName = FName;
	this.LName = LName;
	this.PasswordHint = PasswordHint;
	this.MailPreference = MailPreference;
	this.OptInEmail = OptInEmail;
	this.RememberMe = (RememberMe==1) ? 1 : 0;
	this.ClassPrompt = (ClassPrompt==0) ? 0 : 1;
	this.Classes_ct = Classes_ct;
//alert('RAUserObj.Update :: '+ this.ClassPrompt);
}

RAUserObj.prototype.DisplayAll = function(
) {
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>User ID = '+this.ID +'</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>GUID = </nobr></td><td valign="top">'+this.GUID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Email = </nobr></td><td valign="top">'+this.Email +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>FName = </nobr></td><td valign="top">'+this.FName +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>LName = </nobr></td><td valign="top">'+this.LName +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>PasswordHint = </nobr></td><td valign="top">'+this.PasswordHint +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>MailPreference = </nobr></td><td valign="top">'+this.MailPreference +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>OptInEmail = </nobr></td><td valign="top">'+this.OptInEmail +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>RememberMe = </nobr></td><td valign="top">'+this.RememberMe +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>OnyxStatus = </nobr></td><td valign="top">'+this.OnyxStatus +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>ClassPrompt = </nobr></td><td valign="top">'+this.ClassPrompt +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Classes_ct = </nobr></td><td valign="top">'+this.Classes_ct +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr><b>User SiteLogins</b></nobr></td><td valign="top">';
	for (var i in this.SiteLogins) {if (this.SiteLogins.hasOwnProperty(i)) {
		str += this.SiteLogins[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr><b>User Assignments</b></nobr></td><td valign="top">';
	for (var i in this.UserAssignments) {if (this.UserAssignments.hasOwnProperty(i)) {
		str += this.UserAssignments[i].DisplayAll();
	}}
	str += '</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr><b>User Class Assignments</b></nobr></td><td valign="top">';
	for (var i in this.ClassLogins) {if (this.ClassLogins.hasOwnProperty(i)) {
		str += this.ClassLogins[i].DisplayAll();
	}}
	str += '</td></tr>';
	str += '</table>';
	return str;
}

// *********************************************************
// RASiteLoginObj
// *********************************************************
// Constructor
function RASiteLoginObj (
	RAObj,
	ID,
	User,
	Site,
	LastLogin,
	InstructorEmail,
	SiteAccessRevoked,
	LoggedOn
) {
	if (RAObj==null) return null;
	this.RA = RAObj;

	this.ID = ID;
	this.User = User;
	this.Site = Site;
	this.User.SiteLogins[this.Site.ID] = this;
	this.LastLogin = LastLogin;
	this.InstructorEmail = InstructorEmail;
	this.SiteAccessRevoked = SiteAccessRevoked;
	this.LoggedOn = LoggedOn;

	this.toCookieEntity = function() {
		var outObj = new Object();
		outObj.rat = 'sl';
		outObj.ID = this.ID;
		outObj.UID = this.User.ID;
		outObj.SID = this.Site.ID;
		outObj.ll = this.LastLogin;
		outObj.ie = this.InstructorEmail;
		outObj.sar = this.SiteAccessRevoked;
		outObj.loa = 10;
		try { outObj.loa = new Number(this.Site.CurrentUserAccess()); } catch (e) {}
		outObj.cid = 0;
		outObj.ie = this.InstructorEmail;
		for (var i in this.RA.Classes ) {if (this.RA.Classes.hasOwnProperty(i)) {
			if (this.RA.Classes[i].Code == this.InstructorEmail) {
				try { outObj.cid = new Number(this.RA.Classes[i].ID); } catch (e) {}
			}
		}}
//		outObj.loa = this.loa;
//		outObj.cid = this.cid;
		return outObj;
	}
}

RASiteLoginObj.prototype.Update = function(
	ID,
	User,
	Site,
	LastLogin,
	InstructorEmail,
	SiteAccessRevoked,
	LoggedOn
) {
	this.ID = ID;
	this.User = User;
	this.Site = Site;
	this.User.SiteLogins[this.Site.ID] = this;
	this.LastLogin = LastLogin;
	this.InstructorEmail = InstructorEmail;
	this.SiteAccessRevoked = SiteAccessRevoked;
	this.LoggedOn = LoggedOn;
}

RASiteLoginObj.prototype.DisplayAll = function(
) {
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '<b>SiteLogin</b>';
	str += '<br/>';
	str += 'ID = '+this.ID;
	str += '<br/>';
	str += 'User ID = '+this.User.ID;
	str += '<br/>';
	str += 'Site ID = '+this.Site.ID;
	str += '<br/>';
	str += 'LastLogin = '+this.LastLogin;
	str += '<br/>';
	str += 'InstructorEmail = '+this.InstructorEmail;
	str += '<br/>';
	str += 'SiteAccessRevoked = '+this.SiteAccessRevoked;
	str += '<br/>';
	str += 'LoggedOn = '+this.LoggedOn;
	str += '<br/>';
	return str;
}

// *********************************************************
// RAUserAssignmentObj
// *********************************************************
// Constructor
function RAUserAssignmentObj (
	RAObj,
	ID,
	User,
	Package,
	AccessID,
	Expiration
) {
	if (RAObj==null) return null;
	this.RA = RAObj;

	this.ID = ID;
	this.Package = Package;
	this.User = User;
	this.User.UserAssignments[this.Package.ID] = this;
	this.AccessID = AccessID;
	this.Expiration = Expiration;

	this.toCookieEntity = function() {
		var outObj = new Object();
		outObj.rat = 'ua';
		outObj.ID = this.ID;
		outObj.UID = this.User.ID;
		outObj.PID = this.Package.ID;
		outObj.AID = this.AccessID;
		outObj.ex = this.Expiration;
		return outObj;
	}
}

RAUserAssignmentObj.prototype.Update = function(
	ID,
	User,
	Package,
	AccessID,
	Expiration
) {
	this.ID = ID;
	this.Package = Package;
	this.User = User;
	this.User.UserAssignments[this.Package.ID] = this;
	this.AccessID = AccessID;
	this.Expiration = Expiration;
}

RAUserAssignmentObj.prototype.DisplayAll = function(
) {
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>UserAssignment</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>UserAssignment ID = </nobr></td><td valign="top">'+this.ID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Package = </nobr></td><td valign="top">'+this.Package.ID +' - '+this.Package.Description +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>User AccessID = </nobr></td><td valign="top">'+this.AccessID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>User Expiration = </nobr></td><td valign="top">'+this.Expiration +'</td></tr>';
	str += '</table>';
	return str;
}

// *********************************************************
// RAClassObj
// *********************************************************
// Constructor
function RAClassObj (
	RAObj,
	ID,
	Name,
	Desc,
	Code,
	Exiration,
	Creator_User,
	StartDate,
	EndDate,
	EmailScores,
	RecordStatus
) {
	if (RAObj==null) return null;
	this.RA = RAObj;

	this.ID = ID;
	this.Name = Name;
	this.Desc = Desc;
	this.Code = Code;
	this.Exiration = Exiration;
	this.Creator = Creator_User;
	this.StartDate = StartDate;
	this.EndDate = EndDate;
	this.EmailScores = EmailScores;
	this.RecordStatus = RecordStatus;

	this.toCookieEntity = function() {
		var outObj = new Object();
		outObj.rat = 'c';
		outObj.ID = this.ID;
		outObj.n = this.Name;
		outObj.d = this.Desc;
		outObj.c = this.Code;
		outObj.e = this.Expiration;
		var tmpObj = new Object();
		tmpObj.ID = this.Creator.ID;
		outObj.cr = tmpObj;
		outObj.sd = this.StartDate;
		outObj.ed = this.EndDate;
		outObj.es = this.EmailScores;
		outObj.rs = this.RecordStatus;
		return outObj;
	}
}

RAClassObj.prototype.Update = function(
	ID,
	Name,
	Desc,
	Code,
	Exiration,
	Creator_User,
	StartDate,
	EndDate,
	EmailScores,
	RecordStatus
) {
	this.ID = ID;
	this.Name = Name;
	this.Desc = Desc;
	this.Code = Code;
	this.Exiration = Exiration;
	this.Creator = Creator_User;
	this.StartDate = StartDate;
	this.EndDate = EndDate;
	this.EmailScores = EmailScores;
	this.RecordStatus = RecordStatus;
}

RAClassObj.prototype.DisplayAll = function(
) {
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>Class</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Class ID = </nobr></td><td valign="top">'+this.ID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Name = </nobr></td><td valign="top">'+this.Name +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Desc = </nobr></td><td valign="top">'+this.Desc +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Code = </nobr></td><td valign="top">'+this.Code +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Exiration = </nobr></td><td valign="top">'+this.Exiration +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Creator ID = </nobr></td><td valign="top">'+this.Creator.ID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>StartDate = </nobr></td><td valign="top">'+this.StartDate +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>EndDate = </nobr></td><td valign="top">'+this.EndDate +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>EmailScores = </nobr></td><td valign="top">'+this.EmailScores +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>RecordStatus = </nobr></td><td valign="top">'+this.RecordStatus +'</td></tr>';
	str += '</table>';
	return str;
}

// *********************************************************
// RAClassLoginObj
// *********************************************************
// Constructor
function RAClassLoginObj (
	RAObj,
	User,
	Class,
	AccessRevoked,
	LastLogin
) {
	if (RAObj==null) return null;
	this.RA = RAObj;

	this.User = User;
	this.Class = Class;
	this.User.ClassLogins[this.Class.ID] = this;
	this.AccessRevoked = AccessRevoked;
	this.LastLogin = LastLogin;

	this.toCookieEntity = function() {
		var outObj = new Object();
		outObj.rat = 'cl';
		var tmpObj = new Object();
		tmpObj.ID = this.User.ID;
		outObj.u = tmpObj;
		tmpObj = new Object();
		tmpObj.ID = this.Class.ID;
		outObj.c = tmpObj;
		outObj.ar = this.AccessRevoked;
		outObj.ll = this.LastLogin;
		return outObj;
	}
}

RAClassLoginObj.prototype.Update = function(
	User,
	Class,
	AccessRevoked,
	LastLogin
) {
	this.User = User;
	this.Class = Class;
	this.User.ClassLogins[this.Class.ID] = this;
	this.AccessRevoked = AccessRevoked;
	this.LastLogin = LastLogin;
}

RAClassLoginObj.prototype.DisplayAll = function(
) {
	if (!RA_CtrlWin.RA.dev_check('any')) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>Class Login</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>User ID = </nobr></td><td valign="top">'+this.User.ID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Class ID = </nobr></td><td valign="top">'+this.Class.ID +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>AccessRevoked = </nobr></td><td valign="top">'+this.AccessRevoked +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>LastLogin = </nobr></td><td valign="top">'+this.LastLogin +'</td></tr>';
	str += '</table>';
	return str;
}




function RA_GetRAXS_URL (raxsts) {
	var msg = 'RA_GetRAXS_URL ( '+raxsts+' ) -- ';
	var xhref = $.cookie('RAXSret');
	if (xhref == '' || xhref == null) {
//alert(msg +'NO cookie');
		msg += ' cookie was blank, resetting ';
		xhref = top.location.host + decodeURIComponent(top.location.pathname) + top.location.search + top.location.hash;
		xhref = xhref.replace(/[?&]uid=[0-9]*&rau=[0-9]*/g,'');
		xhref = xhref.replace(/[?&]raxsts=[cio]?[0-9]*/g,'');
		$.cookie('RAXSret',xhref, { path: '/' } );
		var ar = xhref.split('#');
		var ar2 = ar[0].split('?');
		xhref = '';
		for (var i=0; i<ar2.length; i++)
		{
			if (i==1)
				xhref += '?';
			else if (i>1)
				xhref += '&';
			xhref += ar2[i];
		}
		if (raxsts)
		{
			xhref += (ar2.length>1) ? '&raxsts='+raxsts : '?raxsts='+raxsts;
		}
		xhref += (ar.length>1) ? '#'+ar[1]+'' : '';
	}
	else
	{
//alert(msg +'cookie');
		$.cookie('RAXSret','', { path: '/' } );
	}
	msg += ' -- '+ xhref +'<br/>';
	RA_CtrlWin.RA.logDebug(msg);
	RA_CtrlWin.RA.dumpDebug();
//	prompt(msg, xhref);
	return xhref;
}




function RA_CheckRAXS_TimeStamp (RAXSsd) {
	var msg = 'RA_CheckRAXS_TimeStamp';
	var result = false;
	var raxsts = BFW_QStr['raxsts'];
	if (!raxsts)
	{
		if (!RAXSsd)
		{
			result = true;
		}
	}
	else
	{
		result = (RAXSsd == raxsts);
	}
	msg += ' : result='+result;
	RA_CtrlWin.RA.logDebug(msg);
	RA_CtrlWin.RA.dumpDebug();
	return result;
}

function RA_GetRAXSTimeStamp (m) {
	var d = new Date();
	var raxsts = m + d.getTime().toString();
	return raxsts;
}

RAObj.prototype.dev_check = function ( val ) {
	if (val) {
		if (RA_CtrlWin.RA.dev==val || (val=='any' && RA_CtrlWin.RA.dev!='')) return true
	} else {
		if (RA_CtrlWin.RA.dev=='yes') return true
	}
	return false;
}






RAObj.prototype.stringifyReplacer = function (key, value) {
var msg = '<div style="color:red">';
msg += key +' ---- '+ value +'<br/>';
	if (typeof value === 'object') {
//		if (value.RA instanceof RAObj) {
//		if (value instanceof RAUserObj || value instanceof RASiteObj || value instanceof RAClassObj //etc
		if (value instanceof RAObj) 
		{
msg += 'RAObj';
			return;
		}
		if (value.RA === RA_CtrlWin.RA && value.toCookieEntity)
		{
			var outObj = value.toCookieEntity();
msg += 'some RA class Obj : '+ outObj;
msg += ' - '+ outObj.rat +'</div>';
//RA_CtrlWin.RA.logDebug(msg);
//RA_CtrlWin.RA.dumpDebug();
			return outObj;
		}
msg += 'some other obj';
	}
msg += '</div>';
//RA_CtrlWin.RA.logDebug(msg);
//RA_CtrlWin.RA.dumpDebug();
	return value;
}

RAObj.prototype.parseReviver = function (key, value) {
var msg = '<div style="color:red">';
msg += key +' ---- '+ value +'<br/>';
	if (typeof value === 'object')
	{
/*
		if (value.rat)
		{
			switch (value.rat)
			{
			case 'u':
				var myVal = new RAUserObj( RA_CtrlWin.RA, value.ID, value.e, value.fn, value.ln, value.ph, value.mp, value.oi, value.rm, value.cp, value.cct, value.GUID );
				return myVal;
				break;
			default :
			}
		}
*/
	}
msg += '</div>';
//RA_CtrlWin.RA.logDebug(msg);
//RA_CtrlWin.RA.dumpDebug();
	return value;
}




RAObj.prototype.recordError = function (e) {
	var msg = '<span style="color:red;font-weight:bold">ERROR:</span> '+e.lineNumber+' --- '+e.message+'<br/>'
	RA_CtrlWin.RA.logDebug(msg);
	RA_CtrlWin.RA.dumpDebug();
}


