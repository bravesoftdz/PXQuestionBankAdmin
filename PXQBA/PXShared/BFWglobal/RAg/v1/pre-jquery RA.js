var RA = new RAObj();
var RA_CtrlWin = window.self;
var RA_dev = BFW_QStr['radev'];
if (!RA_dev) RA_dev = '';

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
	switch (window.location.host) {
	case '192.168.77.114' :
		this.RARootDomain = '192.168.77.242';
//		this.RARootDomain = 'bcs.bfwpub.com';
		this.RAXSURL = this.RARootDomain +'/RA/RAXS/v1'
		this.OldLoginRefURL = this.RARootDomain +'/login_reference';
		this.OldLoginRefURL = 'bcs.bfwpub.com/login_reference';
		break;
	case '192.168.77.242' :
		this.RARootDomain = '192.168.77.242';
//		this.RARootDomain = 'bcs.bfwpub.com';
		this.RAXSURL = this.RARootDomain +'/RA/RAXS/v1'
		this.OldLoginRefURL = this.RARootDomain +'/login_reference';
		break;
	default :
		this.RARootDomain = 'bcs.bfwpub.com';
		this.RAXSURL = this.RARootDomain +'/RA/RAXS/v1'
		this.OldLoginRefURL = this.RARootDomain +'/login_reference';
	}

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

	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// RAXS

	this.RAXS = new Object();
	this.RAXS.Inited = false;
	this.RAXS.write_js = function (u,s,url) {
//alert(u+','+s+','+url)
		if (!u) u=0;
		if (!s) s=0;
		if (!url) {s=0;url=''}
		var rd = new Date();
		var rt = rd.getTime();
		var raxsurl = "";
		var qstrRAlr_uid = '&RAlr_uid=';
		try {if (RAlr_uid) qstrRAlr_uid += ''+RAlr_uid} catch(e){alert(e.name+' --- '+e.message);}
		if (url=='') {
			raxsurl = "http://"+ RA_CtrlWin.RA.RAXSURL +"/RAXS.asp?u="+u+"&s=0"+qstrRAlr_uid+"&"+ rt +"";
		} else {
			raxsurl = "http://"+ RA_CtrlWin.RA.RAXSURL +"/RAXS.asp?u="+u+"&s="+s+qstrRAlr_uid+"&url="+ encodeURIComponent(url) +"&"+ rt +"";
		}
//prompt('raxsurl',raxsurl);
//		var lrstr = "%3Cscript src='http://"+ RA_CtrlWin.RA.OldLoginRefURL +"/asp/c-ra-js.asp?"+ rt +"' type='text/javascript'%3E%3C/script%3E";

		var rstr = "%3Cscript src='"+ raxsurl +"' type='text/javascript'%3E%3C/script%3E";
		try {
//			document.write(unescape(lrstr));
			document.write(unescape(rstr));
		} catch(e) {
			alert(e.message);
			BFW_Errors.add(e,1000);
			BFW_Errors.LogErrors();
		}
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
			this._if = this.win.document.getElementById('RAif');
			this._win = this._if.contentWindow;
			if (this._win!=null) {
//alert('r 0 4');
				var h = this._win.document.body.offsetHeight;
				h += 20;
//alert(h);
				this._if.style.height = h + 'px';
//alert('r 0 5');
			}
//alert('r 1');
		} catch(e) {
//alert('e1');
		}
		try {
			RA_CtrlWin.RAif_Site_Resize();
//alert('r 2');
		} catch(e) {
//alert('e2');
		}
	}
	this.RAif.updated = false;
	this.RAif.Clear = function () {
			this.updated = false;
			this.vars = new Object();
		}
	this.RAif.vars = new Object();
	this.RAif.switches = new Object();
	this.RAif.div_ID = 'RAif_div';
	this.RAif.win = window.self;
	this.RAif.inited = false;
	this.RAif.init = function (s,m,RAif_winFrame_ID,RAif_div_ID) {
			this.state.push(s);
			this.mode = m;

			this.WaitFor();

			if (RAif_div_ID && RAif_div_ID!='') this.div_ID = RAif_div_ID;
//alert(this.div_ID);
			var RAif_div;
			this.win = window.self;
			if (RAif_winFrame_ID && RAif_winFrame_ID!='') {
				try {
					this.win = document.getElementById(RAif_winFrame_ID).contentWindow;
//alert(this.win);
				} catch(e) {
					try {
						this.win = window.self;
					} catch(e) {
						alert( 'Error, cannot initialize RAif :: '+ e.name +' --- '+ e.message );
					}
				}
			}
			try {
				RAif_div = this.win.document.getElementById(this.div_ID);
//alert(RAif_div);
			} catch(e) {
				try {
					RAif_div = this.win.document.getElementById(this.div_ID);
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
			box += '<iframe id="RAif" style="width: 100%; background-color:transparent; padding:0px; margin:0px;" src="" frameBorder="0" scrolling="no"></iframe>'
			box += '</td>';
			box += '<td id="RAif_divTbl_midRight">&nbsp;</td>';
			box += '</tr>';
			box += '<tr>';
			box += '<td id="RAif_divTbl_botLeft">&nbsp;</td>';
			box += '<td id="RAif_divTbl_botCenter">&nbsp;</td>';
			box += '<td id="RAif_divTbl_botRight">&nbsp;</td>';
			box += '</tr>';
			box += '</table>';
			RAif_div.innerHTML = box;
			this.win.document.getElementById('RAif').src = '/BFWglobal/RAg/v1/RAif.html?url='+ encodeURIComponent(RA_CtrlWin.location.href);
			RAif_div.style.display='block';
			this.inited = true;
		}

	this.RAif.goreturn = function () {
			window.location.href = 'http://192.168.77.114/BFWglobal/RAg/v1/RAif_return.html';
		}

	this.RAif.close = function () {
			while (this.state.stack.length>0) {
				this.state.stack.pop();
			}
			var x = this.win.document.getElementById(this.div_ID);
			x.style.display='none';
			x.innerHTML = '';
			this.inited = false;
			this.close_site();
			if (this.updated) {
				this.Clear();
			}
		}

	this.RAif.close_site = function () {}

	this.RAif.state = new Object();
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
var RA_tempSiteBaseURL = '';
var RA_tempFn = function () {};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.InitCurrentSite = function ( sBaseURL, fn) {
	if (!sBaseURL || sBaseURL=='') {
		RA_tempSiteBaseURL = window.location.host + window.location.pathname;
		RA_tempSiteBaseURL = RA_tempSiteBaseURL.replace('/default.html','');
	} else {
		RA_tempSiteBaseURL = sBaseURL;
	}
	RA_tempFn = function () {};
	if (fn) RA_tempFn = fn;

	RAWS_WaitFor( RA_CtrlWin.RA.InitCurrentSite_2_go );
	RAWS3_GetSiteFromBaseURL( new Array( 'sBaseUrl='+ RA_tempSiteBaseURL ) );
}
RAObj.prototype.InitCurrentSite_2_go = function () {
	RA_CtrlWin.RA.InitCurrentSite_2();
}
RAObj.prototype.InitCurrentSite_2 = function () {
//alert('RA.InitCurrentSite_2 : '+ RAWS_iSiteID +' -- '+ RA_tempSiteBaseURL );
	if (RAWS_udtSites && RAWS_error=='') {
		var S, P, SA, B;
		for (var iS in RAWS_udtSites) {if (RAWS_udtSites.hasOwnProperty(iS)) {
			S = RA_CtrlWin.RA.AddSite( RAWS_udtSites[iS].SiteID, RAWS_udtSites[iS].BaseURL, '' );
			RA_CtrlWin.RA.CurrentSite = S;
			RA_CtrlWin.RA.CurrentSiteInited = true;
			for (var iP in RAWS_udtSites[iS].Packages) {if (RAWS_udtSites[iS].Packages.hasOwnProperty(iP)) {
				P = RA_CtrlWin.RA.AddPackage( RAWS_udtSites[iS].Packages[iP].PackageID, RAWS_udtSites[iS].Packages[iP].Description, RAWS_udtSites[iS].Packages[iP].Type );
				SA = RA_CtrlWin.RA.AddSiteAssignment( RAWS_udtSites[iS].Packages[iP].SiteAssignmentID, P, S, RAWS_udtSites[iS].Packages[iP].LevelOfAccess );
				for (var iB in RAWS_udtSites[iS].Packages[iP].Batches) {if (RAWS_udtSites[iS].Packages[iP].Batches.hasOwnProperty(iB)) {
					B = RA_CtrlWin.RA.AddBatch( RAWS_udtSites[iS].Packages[iP].Batches[iB].BatchID, RAWS_udtSites[iS].Packages[iP].Batches[iB].Description, P, RAWS_udtSites[iS].Packages[iP].Batches[iB].UseByDate, RAWS_udtSites[iS].Packages[iP].Batches[iB].RelativeExpiration,  RAWS_udtSites[iS].Packages[iP].Batches[iB].AbsoluteExpiration,  RAWS_udtSites[iS].Packages[iP].Batches[iB].Suspended, RAWS_udtSites[iS].Packages[iP].Batches[iB].Type, RAWS_udtSites[iS].Packages[iP].Batches[iB].Price );
				}}
			}}
		}}
		RA_tempFn();
	} else {
alert( 'RA.InitCurrentSite_2 ERROR:('+ RAWS_error +')');
	}
//alert('current site = '+ RA_CtrlWin.RA.CurrentSite.ID);
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.InitCurrentUser = function (fn) {
//alert('RA.InitCurrentUser: '+ RA_CtrlWin.RA.CurrentUser +' - '+ RA_CtrlWin.RA.CurrentSite);
	RA_tempFn = function () {};
	if (fn) RA_tempFn = fn;
	if (RA_CtrlWin.RA.CurrentUser != null && RA_CtrlWin.RA.CurrentSite != null) {
		RAWS_WaitFor( RA_CtrlWin.RA.InitCurrentUser_2_go );
		RAWS1_SiteLogin( new Array( 'iUserID='+ RA_CtrlWin.RA.CurrentUser.ID, 'iSiteID='+ RA_CtrlWin.RA.CurrentSite.ID, 'sIPAddr='+ RA_CtrlWin.RA.CurrentUser.IP ) );
	} else {
		RA_tempFn();
	}
}
RAObj.prototype.InitCurrentUser_2_go = function () {
	RA_CtrlWin.RA.InitCurrentUser_2();
}
RAObj.prototype.InitCurrentUser_2 = function () {
//alert('RA.InitCurrentUser_2');
	if (RAWS_error=='') {
		RA_CtrlWin.RA.AddSiteLogin('',RA_CtrlWin.RA.CurrentUser,RA_CtrlWin.RA.CurrentSite,'',RA_CtrlWin.RAWS_sInstructorEmail,0,RA_CtrlWin.RA.CurrentUser.IP );
		RA_tempFn();
	} else {
alert( 'RA.InitCurrentUser_2 ERROR:('+ RAWS_error +')' );
		return false;
	}
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.InitSites = function ( arrSiteIDs, fn) {
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
		RA_tempFn();
	} else {
alert( 'RA.InitSites_2 ERROR:('+ RAWS_error +')');
	}
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
RAObj.prototype.InitCurrentSite_2_go_OLD = function () {
	RA_CtrlWin.RA.InitCurrentSite_2_OLD();
}
RAObj.prototype.InitCurrentSite_2_OLD = function () {
//alert('RA.InitCurrentSite_2 : '+ RAWS_iSiteID +' -- '+ RA_tempSiteBaseURL );
	if (RAWS_iSiteID>0 && RAWS_error=='') {
		RA_CtrlWin.RA.CurrentSite = RA_CtrlWin.RA.AddSite( RAWS_iSiteID, RA_tempSiteBaseURL, '' );
		if (RA_CtrlWin.RA.CurrentUser != null) {
			RAWS_WaitFor( RA_CtrlWin.RA.InitCurrentUser );
			RAWS1_SiteLogin( new Array( 'iUserID='+ RA_CtrlWin.RA.CurrentUser.ID, 'iSiteID='+ RA_CtrlWin.RA.CurrentSite.ID, 'sIPAddr='+ RA_CtrlWin.RA.CurrentUser.IP ) );
		} else {
			RA_tempFn();
		}
	} else {
alert( 'RA.InitCurrentSite_2 ERROR:('+ RAWS_error +')');
	}
//alert('current site = '+ RA_CtrlWin.RA.CurrentSite.ID);
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
	ClassPrompt
) {
//alert('AddUser :: '+ ID +' :: '+ ClassPrompt);
	if ( ! this.Users[ID] ) {
		this.Users[ID] = new RAUserObj(this, ID, Email, FName, LName, PasswordHint, MailPreference, OptInEmail, RememberMe, ClassPrompt );
	} else {
		this.Users[ID].Update( ID, Email, FName, LName, PasswordHint, MailPreference, OptInEmail, RememberMe, ClassPrompt );
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






RAObj.prototype.ClearUser = function(
) {
	for (var i in this.UserAssignments) {if (this.UserAssignments.hasOwnProperty(i)) {
		delete this.UserAssignments[i];
	}}

	for (var i in this.SiteLogins) {if (this.SiteLogins.hasOwnProperty(i)) {
		delete this.SiteLogins[i];
	}}

	for (var i in this.ClassLogins) {if (this.ClassLogins.hasOwnProperty(i)) {
		delete this.ClassLogins[i];
	}}

	for (var i in this.Users) {if (this.Users.hasOwnProperty(i)) {
		if (this.CurrentUser == this.Users[i]) {
			delete this.Users[i];
		}
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

	this.CurrentClass = null;
	for (var i in this.Classes) {if (this.Classes.hasOwnProperty(i)) {
		delete this.Classes[i];
	}}

	this.CurrentUser = null;
	for (var i in this.Users) {if (this.Users.hasOwnProperty(i)) {
		delete this.Users[i];
	}}
*/
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
	} else if (LevelOfAccess >= 90) {
		return 'Production';
	} else if (LevelOfAccess >= 88) {
		return 'QA';
	} else if (LevelOfAccess >= 85) {
		return 'Editor';
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

RAObj.prototype.DisplayAll = function(
) {
	if (!RA_dev_check()) return '';

	var str = '';
	str += '<hr>';

	if (this.CurrentUser!=null) {
		str += 'CurrentUser.ID = '+this.CurrentUser.ID;
		str += '<br/>';
		str += 'CurrentUser.Email = '+this.CurrentUser.Email;
		str += '<br/>';
		str += 'CurrentUser.FName / LName = '+this.CurrentUser.FName+' '+this.CurrentUser.LName;
		str += '<br/>';
		str += 'CurrentUser CurrentSiteAccess = '+this.GetLevelOfAccess_Description(this.CurrentSiteAccess());
		str += '<br/>';
		str += 'CurrentUser.IP = '+this.CurrentUser.IP;
		str += '<br/>';
		str += '<br/>';
	} else {
		str += 'CurrentUser = '+this.CurrentSite;
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

	str += '<hr><table>';
	str += '<tr><td valign="top"><b><nobr>Products</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Products) {if (this.Products.hasOwnProperty(i)) {
		str += this.Products[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr><table>';
	str += '<tr><td valign="top"><b><nobr>Sites</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Sites) {if (this.Sites.hasOwnProperty(i)) {
		str += this.Sites[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr><table>';
	str += '<tr><td valign="top"><b><nobr>Site Assignments</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.SiteAssignments) {if (this.SiteAssignments.hasOwnProperty(i)) {
		str += this.SiteAssignments[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr><table>';
	str += '<tr><td valign="top"><b><nobr>Packages</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Packages) {if (this.Packages.hasOwnProperty(i)) {
		str += this.Packages[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr><table>';
	str += '<tr><td valign="top"><b><nobr>Batches</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Batches) {if (this.Batches.hasOwnProperty(i)) {
		str += this.Batches[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr><table>';
	str += '<tr><td valign="top"><b><nobr>Users</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Users) {if (this.Users.hasOwnProperty(i)) {
		str += this.Users[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr><table>';
	str += '<tr><td valign="top"><b><nobr>Classes</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.Classes) {if (this.Classes.hasOwnProperty(i)) {
		str += this.Classes[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr><table>';
	str += '<tr><td valign="top"><b><nobr>Class Logins</nobr></b></td><td></td></tr>';
	str += '<tr><td valign="top" width="10"></td><td valign="top">';
	for (var i in this.ClassLogins) {if (this.ClassLogins.hasOwnProperty(i)) {
		str += this.ClassLogins[i].DisplayAll();
		str += '<br/>';
	}}
	str += '</td></tr>';
	str += '</table>';

	str += '<hr>';

	str += '<b>http://'+ this.RAXSURL +'/debugvars.asp ...</b>';
	str += '<br/>';
	str += '<iframe src="http://'+ this.RAXSURL +'/debugvars.asp" width="100%" height="400"></iframe>';

	str += '<hr>';

	return str;
}


// *********************************************************
// RAProductObj
// *********************************************************
// Constructor
function RAProductObj (
	RAObj,
	ID, 
	Title,
	Type,
	TypeObj
) {
	if (RAObj==null) return null;
	this.RA = RAObj;

	this.ID = ID;
	this.Title = Title;
	this.Type = Type;
	this.TypeObj = TypeObj;
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
	return this.DefaultDisplayAll();
}

RAProductObj.prototype.DefaultDisplayAll = function(
) {
	if (!RA_dev_check()) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>Product ID = '+ this.ID +'</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Title = </nobr></td><td valign="top">'+this.Title +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Type = </nobr></td><td valign="top">'+this.Type +'</td></tr>';
	switch (this.Type) {
		case 'RASite' :
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">(Site, ID='+this.TypeObj.ID +')</td></tr>';
		break;
		default :
	str += '<tr><td valign="top" width="10"><nobr>TypeObj = </nobr></td><td valign="top">'+this.TypeObj +'</td></tr>';
	}
	for (var i in this) {if (this.hasOwnProperty(i)) {
		if (i!='RA' && i!='ID' && i!='Title' && i!='Type' && i!='TypeObj' && i!='DisplayAll') {
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
			case 'RASite' :
//				var rightNow = Date();
				for (var i in this.RA.CurrentUser.UserAssignments) {if (this.RA.CurrentUser.UserAssignments.hasOwnProperty(i)) {
					if (this.TypeObj.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ] ) {
/*
alert(this.RA.CurrentUser.UserAssignments[i].Expiration);
alert(rightNow);
alert( this.RA.CurrentUser.UserAssignments[i].Expiration > rightNow );
*/

						retAccess = this.TypeObj.PackageAssignments[ this.RA.CurrentUser.UserAssignments[i].Package.ID ].LevelOfAccess;

					}
				}}
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
	if (!RA_dev_check()) return '';

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
	if (!RA_dev_check()) return '';

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
	if (!RA_dev_check()) return '';

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
	if (!RA_dev_check()) return '';

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
	ClassPrompt
) {
//alert('RAUserObj :: '+ ID);
	if (RAObj==null) return null;
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
//alert('RAUserObj :: '+ this.ClassPrompt);
	this.SiteLogins = new Object();

	this.ClassLogins = new Object();

	this.UserAssignments = new Object();
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
	ClassPrompt
) {
//alert('RAUserObj :: '+ ID);
	this.ID = ID;
	this.Email = Email;
	this.FName = FName;
	this.LName = LName;
	this.PasswordHint = PasswordHint;
	this.MailPreference = MailPreference;
	this.OptInEmail = OptInEmail;
	this.RememberMe = (RememberMe==1) ? 1 : 0;
	this.ClassPrompt = (ClassPrompt==0) ? 0 : 1;
//alert('RAUserObj.Update :: '+ this.ClassPrompt);
}

RAUserObj.prototype.DisplayAll = function(
) {
	if (!RA_dev_check()) return '';

	var str = '';
	str += '<table>';
	str += '<tr><td valign="top" colspan="2"><b>User ID = '+this.ID +'</b></td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>Email = </nobr></td><td valign="top">'+this.Email +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>FName = </nobr></td><td valign="top">'+this.FName +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>LName = </nobr></td><td valign="top">'+this.LName +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>PasswordHint = </nobr></td><td valign="top">'+this.PasswordHint +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>MailPreference = </nobr></td><td valign="top">'+this.MailPreference +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>OptInEmail = </nobr></td><td valign="top">'+this.OptInEmail +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>RememberMe = </nobr></td><td valign="top">'+this.RememberMe +'</td></tr>';
	str += '<tr><td valign="top" width="10"><nobr>ClassPrompt = </nobr></td><td valign="top">'+this.ClassPrompt +'</td></tr>';
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
	if (!RA_dev_check()) return '';

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
	if (!RA_dev_check()) return '';

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
	if (!RA_dev_check()) return '';

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
	if (!RA_dev_check()) return '';

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




function RA_dev_check () {
	if (RA_dev=='yes') return true
	return false;
}












