var useRAWS3 = true;
if (RA_CtrlWin.RA.dev_check()) useRAWS3 = true;

function RAif_Resize () {
//alert(1);
	RA_CtrlWin.RA.RAif.Resize();
//alert(3);
}



function RA_init () {
//if (RA_CtrlWin.RA.dev_check()) alert('go: '+ RA_CtrlWin.RA.RAif.state.current() );

	if (RA_CtrlWin.RA.CurrentSite == null) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('nosite');
		RA_DrawPage();
	} else if (BFW_QStr['clear']=='true') {
//alert('clear = true');
//alert( 'uid = '+ RAreturn_uid );
		RA_CtrlWin.RA.InitCurrentUser( RA_init_2 );
//alert('user inited');
	} else {
		RA_init_2();
//$('#RA_Page').html('test');

	}
}

function RA_init_2 () {
//alert('RA_init_2');

	if (RA_CtrlWin.RA.RAif.state.current() == 'quizclassprompt') {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('quizprompt');
	}

	switch (RA_CtrlWin.RA.RAif.state.current()) {
		case 'quizprompt' :
//INSTRUCTOR EMAIL VERSION
			if (RA_CtrlWin.RA.CurrentUser != null) {
				RA_CtrlWin.RA.RAif.vars['sInstructorEmail'] = RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail;
			} else {
				RA_CtrlWin.RA.RAif.state.push('checkemail');
			}
			RA_DrawPage();
			if (RA_CtrlWin.RA.RAif.updated && RA_CtrlWin.RA.CurrentUser.ClassPrompt==0) {
				setTimeout('RA_QuizClassPromptedYes()', 5);
			}
		break;
		case 'quizclassprompt' :
//CLASS PROMPT VERSION
			if (RA_CtrlWin.RA.CurrentUser != null) {
				var tmpOneClass = null;
				for (var i in RA_CtrlWin.RA.CurrentUser.ClassLogins) {if (RA_CtrlWin.RA.CurrentUser.ClassLogins.hasOwnProperty(i)) {
					UserClassesCt ++;
					if (UserClassesCt==1) tmpOneClass = RA_CtrlWin.RA.CurrentUser.ClassLogins[i].Class;
				}}
				if (RA_CtrlWin.RA.RAif.updated && RA_CtrlWin.RA.CurrentUser.ClassPrompt==0) {
					RA_DrawPage();
					$('#RA_quizclassprompt_1').hide('','');
					$('#RA_quizclassprompt_2').hide('','');
					$('#RA_quizclassprompt_3').hide('','');
					$('#RA_quizclassprompt_4').hide('','');
					$('#RA_quizclassprompt_5').show('','');
					setTimeout('RA_QuizClassPromptedYes()', 5);
					RAif_Resize();
//window.self.focus();
				} else if (UserClassesCt>1) {
					RA_DrawPage();
					$('#RA_quizclassprompt_1').hide('','');
					$('#RA_quizclassprompt_2').hide('','');
					$('#RA_quizclassprompt_3').show('','');
					$('#RA_quizclassprompt_4').hide('','');
				} else if (UserClassesCt==1) {
					if (RA_CtrlWin.RA.CurrentUser.ClassUsing == null) {
						RA_CtrlWin.RA.CurrentUser.ClassUsing = tmpOneClass;
					}
					RA_DrawPage();
					$('#RA_quizclassprompt_1').hide('','');
					$('#RA_quizclassprompt_2').hide('','');
					$('#RA_quizclassprompt_3').show('','');
					$('#RA_quizclassprompt_4').hide('','');
				} else {
					RA_DrawPage();
					$('#RA_quizclassprompt_1').show('','');
					$('#RA_quizclassprompt_2').hide('','');
					$('#RA_quizclassprompt_3').hide('','');
					$('#RA_quizclassprompt_4').hide('','');
				}
				RAif_Resize();
//window.self.focus();

			} else {
				RA_CtrlWin.RA.RAif.state.push('checkemail');
				RA_DrawPage();
			}
		break;
		case 'quizjoinedclass' :
			for (var i in RA_CtrlWin.RA.CurrentUser.ClassLogins) {if (RA_CtrlWin.RA.CurrentUser.ClassLogins.hasOwnProperty(i)) {
				if (RA_CtrlWin.RA.RAif.vars['UsingClassID']==RA_CtrlWin.RA.CurrentUser.ClassLogins[i].Class.ID) RA_CtrlWin.RA.CurrentUser.ClassUsing = RA_CtrlWin.RA.CurrentUser.ClassLogins[i].Class;
			}}
			RA_CtrlWin.RA.RAif.updated = true;
			RA_CtrlWin.RA.CurrentUser.ClassPrompt = 0;
			RA_DrawPage();
			$('#RA_quizclassprompt_5').show('','');
			RAif_Resize();
//window.self.focus();
			setTimeout('RA_QuizClassPromptedYes()', 5);
		break;
		case 'dologin' :
			RA_CtrlWin.RA.RAif.state.pop();
			RA_CtrlWin.RA.RAif.state.push('checkemail');
//			RA_DrawPage();
			RAif_timeout = setTimeout('RA_CheckEmailANDLogin()', 5);

		break;
		case 'dologout' :
			RA_CtrlWin.RA.RAif.state.pop();
			RA_CtrlWin.RA.RAif.state.push('logout');
			RAif_timeout = setTimeout('RAXS_Logout()', 5);
		break;
		case 'docheckemail' :
			RA_CtrlWin.RA.RAif.state.pop();
			RA_CtrlWin.RA.RAif.state.push('checkemail');
//			RA_DrawPage();
			RAif_timeout = setTimeout('RA_CheckEmail()', 5);
		break;
		case 'updateprofile' :
			RA_CtrlWin.RA.RAif.vars['sUserEmail'] = RA_CtrlWin.RA.CurrentUser.Email;
			RA_CtrlWin.RA.RAif.vars['sUserFirstName'] = RA_CtrlWin.RA.CurrentUser.FName;
			RA_CtrlWin.RA.RAif.vars['sUserLastName'] = RA_CtrlWin.RA.CurrentUser.LName;
			RA_DrawPage();
		break;
		case 'docheckout' :
			RAif_timeout = setTimeout('RA_CartCheckItems()', 5);
		break;
		case 'doassignusercodes' :
			RA_CtrlWin.RA.RAif.state.pop();
			RA_CtrlWin.RA.RAif.state.push('assignusercodes');
			RAif_timeout = setTimeout('RA_AssignUserCodes()', 5);
		break;
		default :
//alert(1);
			RA_DrawPage();
//alert(2);
	}
//	RA_hidden_if = $('#RA_hidden')[0];
}

//  ********************************************************************************

function RA_goLogin () {
	RA_CtrlWin.RA.RAif.vars['Email'] = RAWS_cleanInput($('#RA_Email')[0].value);
	RA_CtrlWin.RA.RAif.vars['Password'] = RAWS_cleanInput($('#RA_Password')[0].value);
	RA_CtrlWin.RA.RAif.vars['RememberMe'] = 0;
	if (!RAif_validEmail(RA_CtrlWin.RA.RAif.vars['Email'])) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		$('#RA_formError_login').show('','');
		$('#RA_formError_login').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
		return;
	}
/*
	if ($('#RA_RememberMe')[0]) {
		if ($('#RA_RememberMe')[0].checked) {
			RA_CtrlWin.RA.RAif.vars['RememberMe'] = 1;
		}
	}
*/
	RA_Login();
}

function RA_Login () {
//alert(RA_CtrlWin.RA.RAif.vars['Email'] +' / '+ RA_CtrlWin.RA.RAif.vars['Password'])
	RA_CtrlWin.RA.RAif.state.push('loggingin');
	RA_DrawPage();
	if (useRAWS3) {
//		RA_CtrlWin.RA.RAWS.Send( RA_Login_0_go, RAWS3_UserAuthentication, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sPassword='+RA_CtrlWin.RA.RAif.vars['Password'] ) );
		RA_CtrlWin.RA.RAWS.Send( RA_Login_0_go, RAWS1_UserAuthentication, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sPassword='+RA_CtrlWin.RA.RAif.vars['Password'] ) );
	} else {
		RA_CtrlWin.RA.RAWS.Send( RA_Login_0_go, RAWS1_UserAuthentication, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sPassword='+RA_CtrlWin.RA.RAif.vars['Password'] ) );
	}
}
function RA_Login_0_go () {
	RA_Login_0();
}
function RA_Login_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
	if ( RA_CtrlWin.RAWS_error=='' && RA_CtrlWin.RAWS_iUserID>0 ) {
		RAXS_Login_continue(RA_CtrlWin.RAWS_iUserID, 'loggedin');
	} else if ( RA_CtrlWin.RAWS_error.indexOf('Invalid email address format.')>-1 ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		$('#RA_formError_login').show('','');
		$('#RA_formError_login').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
	} else if ( RA_CtrlWin.RAWS_error=='That e-mail address is registered with a different password. Please enter valid password.' ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = 'The password you entered is incorrect. Please try again. If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
		RA_DrawPage();
		$('#RA_formError_login').show('','');
		$('#RA_formError_login').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	} else if ( RA_CtrlWin.RAWS_error=='That password is incorrect.' ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = 'The password you entered is incorrect. Please try again. If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
		RA_DrawPage();
		$('#RA_formError_login').show('','');
		$('#RA_formError_login').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	} else if ( RA_CtrlWin.RAWS_error=='E-mail address not found. Check spelling and make sure you are using the e-mail address with which you registered. ' ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('register');
		RA_CtrlWin.RA.RAif.vars['Error'] = '';
		RA_DrawPage();
		RAif_Resize();
//window.self.focus();
//		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
//		RA_DrawPage();
//		$('#RA_formError_login').show('','');
//		$('#RA_formError_login').html(RA_CtrlWin.RA.RAif.vars['Error']);
//		RAif_Resize();
	} else {
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
//prompt( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- ', RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		RA_DrawPage();
		$('#RA_formError_login').show('','');
		$('#RA_formError_login').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	}
}

//  ********************************************************************************

function RA_goLogout () {
	RAXS_Logout();
}


//  ********************************************************************************

function RA_doEmailPassword () {
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('emailpassword');
	if (RA_CtrlWin.RA.RAif.vars['Email']=='') {
		RA_DrawPage();
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Enter your e-mail address.';
		if ($('#RA_Email_error')[0]) {
			$('#RA_Email_error').css('color','#f00');
		} else {
			$('#RA_formError_emailpassword').html(RA_CtrlWin.RA.RAif.vars['Error']);
			$('#RA_formError_emailpassword').show('','');
		}
		return;
	}
	RA_EmailPassword();
}

function RA_goEmailPassword () {
	if ($('#RA_Email_error')[0]) {
		$('#RA_Email_error').css('color','#000');
	} else {
		$('#RA_formError_emailpassword').hide('','');
	}
	if ($('#RA_Email')[0].value=='') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Enter your e-mail address.';
		if ($('#RA_Email_error')[0]) {
			$('#RA_Email_error').css('color','#f00');
		} else {
			$('#RA_formError_emailpassword').html(RA_CtrlWin.RA.RAif.vars['Error']);
			$('#RA_formError_emailpassword').show('','');
		}
		return;
	}
	RA_CtrlWin.RA.RAif.vars['Email'] = RAWS_cleanInput($('#RA_Email')[0].value);
	if (!RAif_validEmail(RA_CtrlWin.RA.RAif.vars['Email'])) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		$('#RA_formError_emailpassword').show('','');
		$('#RA_formError_emailpassword').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
		return;
	}
	RA_EmailPassword();
}

function RA_EmailPassword () {
//alert(RA_CtrlWin.RA.RAif.vars['Email'] +' / '+ RA_CtrlWin.RA.RAif.vars['Password'])
	RA_CtrlWin.RA.RAif.state.push('emailingpassword');
	RA_DrawPage();
	if (useRAWS3) {
		RA_CtrlWin.RA.RAWS.Send( RA_EmailPassword_0_go, RAWS3_EmailLogins, new Array( 'sUserEmail='+RA_CtrlWin.RA.RAif.vars['Email'] ) );
	} else {
		RA_CtrlWin.RA.RAWS.Send( RA_EmailPassword_0_go, RAWS1HCL_EmailLogins, new Array( 'sUserEmail='+RA_CtrlWin.RA.RAif.vars['Email'] ) );
	}
}
function RA_EmailPassword_0_go () {
	RA_EmailPassword_0();
}
function RA_EmailPassword_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
	if ( RA_CtrlWin.RAWS_error=='' ) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('emailedpassword');
		RA_DrawPage();
	} else if ( RA_CtrlWin.RAWS_error=='User not found.' ) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('register');
		RA_DrawPage();
		RAif_Resize();
//window.self.focus();
	} else if ( RA_CtrlWin.RAWS_error.indexOf('Invalid UserEmail format.') > -1 ) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		$('#RA_formError_emailpassword').show('','');
		$('#RA_formError_emailpassword').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	} else {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('emailedpassword');
		RA_DrawPage();
return false;
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		RA_DrawPage();
		$('#RA_formError_emailpassword').show('','');
		$('#RA_formError_emailpassword').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	}
}



//  ********************************************************************************

function RA_goCheckEmail () {
	if ($('#RA_Email_error')[0]) {
		$('#RA_Email_error').css('color','#000');
	} else {
		$('#RA_formError_checkemail').hide('','');
	}
	if ($('#RA_Email')[0].value=='') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Enter your e-mail address and we\'ll check it for you.';
		if ($('#RA_Email_error')[0]) {
			$('#RA_Email_error').css('color','#f00');
		} else {
			$('#RA_formError_checkemail').html(RA_CtrlWin.RA.RAif.vars['Error']);
//			$('#RA_formError_checkemail').show('','');
			$('#RA_formError_checkemail').show('','');
		}
		return;
	}
	var tmpE = $('#RA_Email')[0].value;
	if (!RAif_validEmail(tmpE)) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		$('#RA_formError_checkemail').show('','');
		$('#RA_formError_checkemail').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
		return;
	}
	RA_CtrlWin.RA.RAif.vars['Email'] = RAWS_cleanInput(tmpE);
	RA_CheckEmail();
}

function RA_CheckEmail () {
//alert(RA_CtrlWin.RA.RAif.vars['Email'] +' / '+ RA_CtrlWin.RA.RAif.vars['Password'])
	RA_CtrlWin.RA.RAif.state.push('checkingemail');
	RA_DrawPage();
	if (useRAWS3) {
		RA_CtrlWin.RA.RAWS.Send( RA_CheckEmail_0_goRAWS3, RAWS3_CheckUsername, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sBaseUrl=' ) );
	} else {
		RA_CtrlWin.RA.RAWS.Send( RA_CheckEmail_0_go, RAWS1_GetUsernamePasswordHint, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sBaseUrl=' ) );
	}
}
function RA_CheckEmail_0_goRAWS3 () {
	RA_CheckEmail_0RAWS3();
}
function RA_CheckEmail_0RAWS3 () {
	RA_CtrlWin.RA.RAif.state.pop();
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
	if ( RA_CtrlWin.RAWS_error=='' ) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('checkedemail');
		RA_DrawPage();
	} else if ( RA_CtrlWin.RAWS_error=='User not found.' || RA_CtrlWin.RAWS_error=='User Not found.' ) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('register');
		RA_DrawPage();
		RAif_Resize();
//window.self.focus();
	} else if ( RA_CtrlWin.RAWS_error.indexOf('Invalid email address format.')>-1 ) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		$('#RA_formError_checkemail').show('','');
		$('#RA_formError_checkemail').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	} else {
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		RA_DrawPage();
		$('#RA_formError_checkemail').show('','');
		$('#RA_formError_checkemail').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	}
}



function RA_CheckEmail_0_go () {
	RA_CheckEmail_0();
}
function RA_CheckEmail_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
	if ( RA_CtrlWin.RAWS_error=='' ) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('checkedemail');
		RA_DrawPage();
	} else if ( RA_CtrlWin.RAWS_error=='User not found.' || RA_CtrlWin.RAWS_error=='User Not found.' ) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('register');
		RA_DrawPage();
		RAif_Resize();
//window.self.focus();
	} else if ( RA_CtrlWin.RAWS_error.indexOf('Invalid email address format.')>-1 ) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		$('#RA_formError_checkemail').show('','');
		$('#RA_formError_checkemail').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	} else {
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		RA_DrawPage();
		$('#RA_formError_checkemail').show('','');
		$('#RA_formError_checkemail').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	}
}



//  ********************************************************************************

function RA_goCheckEmailANDLogin () {
	if ($('#RA_Email_error')[0]) {
		$('#RA_Email_error').css('color','#000');
	} else {
		$('#RA_formError_checkandemail').hide('','');
	}
	$('#RA_formError_checkemaillogin').hide('','');
	$('#RA_formError_checkemaillogin').css('color','#000');
	if ($('#RA_EmailLOGIN')[0].value=='' || $('#RA_EmailLOGIN')[0].value=='e-mail address') {
		$('#RA_Email_error').css('color','#f00');
		return;
	}
	RA_CtrlWin.RA.RAif.vars['Email'] = RAWS_cleanInput($('#RA_EmailLOGIN')[0].value);
	if (!RAif_validEmail(RA_CtrlWin.RA.RAif.vars['Email'])) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		$('#RA_formError_checkemaillogin').show('','');
		$('#RA_formError_checkemaillogin').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
		return;
	}
	if ($('#RA_Password')[0].value == '') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please enter your password to log in.';
		$('#RA_formError_checkemaillogin').css('color','#f00');
		$('#RA_formError_checkemaillogin').show('','');
		return;
	}
	RA_CtrlWin.RA.RAif.vars['Password'] = RAWS_cleanInput($('#RA_Password')[0].value);
	RA_CheckEmailANDLogin();
}


function RA_CheckEmailANDLogin () {
//alert(RA_CtrlWin.RA.RAif.vars['Email'] +' / '+ RA_CtrlWin.RA.RAif.vars['Password'])
	if (!RAif_validEmail(RA_CtrlWin.RA.RAif.vars['Email'])) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		if ($('#RA_formError_checkemail')[0]) {
			$('#RA_formError_checkemail').css('color','#f00');
			$('#RA_formError_checkemail').show('','');
			$('#RA_formError_checkemail').html(RA_CtrlWin.RA.RAif.vars['Error']);
		} else {
			$('#RA_formError_login').show('','');
			$('#RA_formError_login').html(RA_CtrlWin.RA.RAif.vars['Error']);
		}
		RAif_Resize();
		return;
	}
	RA_CtrlWin.RA.RAif.state.push('checkemailloggingin');
	RA_DrawPage();
//alert('SEND auth');
	if (useRAWS3) {
//		RA_CtrlWin.RA.RAWS.Send( RA_CheckEmailANDLogin_0_go, RAWS3_UserAuthentication, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sPassword='+RA_CtrlWin.RA.RAif.vars['Password'] ) );
		RA_CtrlWin.RA.RAWS.Send( RA_CheckEmailANDLogin_0_go, RAWS1_UserAuthentication, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sPassword='+RA_CtrlWin.RA.RAif.vars['Password'] ) );
	} else {
		RA_CtrlWin.RA.RAWS.Send( RA_CheckEmailANDLogin_0_go, RAWS1_UserAuthentication, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sPassword='+RA_CtrlWin.RA.RAif.vars['Password'] ) );
	}
}
function RA_CheckEmailANDLogin_0_go () {
	RA_CheckEmailANDLogin_0();
}
function RA_CheckEmailANDLogin_0 () {
//alert('DONE auth');
	RA_CtrlWin.RA.RAif.state.pop();
	if ( RA_CtrlWin.RAWS_error=='' && RA_CtrlWin.RAWS_iUserID>0 ) {
		RAXS_Login_continue(RA_CtrlWin.RAWS_iUserID, 'checkemailloggedin');
//		if ($('#RA_Login_rememberMe')[0].checked) {
//			RA_ControlWindow.RARememberMe = 1;
//		}
	} else if ( RA_CtrlWin.RAWS_error=='E-mail address not found. Check spelling and make sure you are using the e-mail address with which you registered. ' ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('register');
		RA_CtrlWin.RA.RAif.vars['Error'] = '';
		RA_DrawPage();
		RAif_Resize();
//window.self.focus();
//		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
//		RA_DrawPage();
//		$('#RA_formError_login').show('','');
//		$('#RA_formError_login').html(RA_CtrlWin.RA.RAif.vars['Error']);
//		RAif_Resize();
	} else if ( RA_CtrlWin.RAWS_error.indexOf('Invalid email address format.')>-1 ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		if (RA_CtrlWin.RA.RAif.state.current() == 'checkemail') {
			$('#RA_formError_checkemail').show('','');
			$('#RA_formError_checkemail').html(RA_CtrlWin.RA.RAif.vars['Error']);
		} else {
			$('#RA_formError_checkemaillogin').show('','');
			$('#RA_formError_checkemaillogin').html(RA_CtrlWin.RA.RAif.vars['Error']);
		}
		RAif_Resize();
	} else if ( RA_CtrlWin.RAWS_error=='That e-mail address is registered with a different password. Please enter valid password.' ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = 'The password you entered is incorrect. Please try again. If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('checkedemail');
		RA_DrawPage();
		$('#RA_formError_checkemaillogin').show('','');
		$('#RA_formError_checkemaillogin').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
	} else if ( RA_CtrlWin.RAWS_error=='That password is incorrect.' ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = 'The password you entered is incorrect. Please try again. If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
		RA_DrawPage();
		$('#RA_formError_checkemaillogin').show('','');
		$('#RA_formError_checkemaillogin').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
	} else {
//prompt('error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- ', RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		RA_DrawPage();
		$('#RA_formError_checkemaillogin').show('','');
		$('#RA_formError_checkemaillogin').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
	}
}


//  ********************************************************************************

function RA_goCheckEmailLogin () {
	$('#RA_formError_checkemaillogin').hide('','');
	$('#RA_formError_checkemaillogin').css('color','#000');
	if ($('#RA_Password')[0].value == '') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please enter your password to log in.';
		$('#RA_formError_checkemaillogin').css('color','#f00');
		$('#RA_formError_checkemaillogin').show('','');
		return;
	}
	RA_CtrlWin.RA.RAif.vars['Password'] = RAWS_cleanInput($('#RA_Password')[0].value);
	RA_CheckEmailLogin();
}


function RA_CheckEmailLogin () {
//alert(RA_CtrlWin.RA.RAif.vars['Email'] +' / '+ RA_CtrlWin.RA.RAif.vars['Password'])
	RA_CtrlWin.RA.RAif.state.push('checkemailloggingin');
	RA_DrawPage();
	if (useRAWS3) {
//		RA_CtrlWin.RA.RAWS.Send( RA_CheckEmailLogin_0_go, RAWS3_UserAuthentication, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sPassword='+RA_CtrlWin.RA.RAif.vars['Password'] ) );
		RA_CtrlWin.RA.RAWS.Send( RA_CheckEmailLogin_0_go, RAWS1_UserAuthentication, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sPassword='+RA_CtrlWin.RA.RAif.vars['Password'] ) );
	} else {
		RA_CtrlWin.RA.RAWS.Send( RA_CheckEmailLogin_0_go, RAWS1_UserAuthentication, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sPassword='+RA_CtrlWin.RA.RAif.vars['Password'] ) );
	}
}
function RA_CheckEmailLogin_0_go () {
	RA_CheckEmailLogin_0();
}
function RA_CheckEmailLogin_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
	if ( RA_CtrlWin.RAWS_error=='' && RA_CtrlWin.RAWS_iUserID>0 ) {
		RAXS_Login_continue(RA_CtrlWin.RAWS_iUserID, 'checkemailloggedin');
//		if ($('#RA_Login_rememberMe')[0].checked) {
//			RA_ControlWindow.RARememberMe = 1;
//		}
	} else if ( RA_CtrlWin.RAWS_error.indexOf('Invalid email address format.')>-1 ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your e-mail address cannot contain spaces or special characters such as apostrophes. Please check your spelling or register with a different e-mail address.';
		RA_DrawPage();
		$('#RA_formError_checkemaillogin').show('','');
		$('#RA_formError_checkemaillogin').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
	} else if ( RA_CtrlWin.RAWS_error=='That e-mail address is registered with a different password. Please enter valid password.' ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = 'The password you entered is incorrect. Please try again. If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
		RA_DrawPage();
		$('#RA_formError_checkemaillogin').show('','');
		$('#RA_formError_checkemaillogin').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
	} else if ( RA_CtrlWin.RAWS_error=='That password is incorrect.' ) {
//alert( 'error 1 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = 'The password you entered is incorrect. Please try again. If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
		RA_DrawPage();
		$('#RA_formError_checkemaillogin').show('','');
		$('#RA_formError_checkemaillogin').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
	} else {
//prompt('error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- ', RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		RA_DrawPage();
		$('#RA_formError_checkemaillogin').show('','');
		$('#RA_formError_checkemaillogin').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
	}
}


//  ********************************************************************************

function RA_RegYesLogin () {
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('checkemaillogin');
	RA_DrawPage();
}

function RA_RegNoReg () {
	RA_CtrlWin.RA.RAif.vars['RegAlreadyAsked'] = true;
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('checkemail');
	RA_DrawPage();
}

function RA_LoginYesReg () {
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('register');
	RA_DrawPage();
}

function RA_LoginNoCheck () {
	RA_CtrlWin.RA.RAif.vars['RegAlreadyAsked'] = false;
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('checkemail');
	RA_DrawPage();
}

//  ********************************************************************************

function RA_goRegister () {
//	RA_CtrlWin.RA.RAif.vars['Email'] = RAWS_cleanInput($('#RA_Email')[0].value);
	RA_CtrlWin.RA.RAif.vars['Email_confirm'] = RAWS_cleanInput($('#RA_Email_confirm')[0].value);
	RA_CtrlWin.RA.RAif.vars['FName'] = RAWS_cleanInput($('#RA_FName')[0].value);
	RA_CtrlWin.RA.RAif.vars['LName'] = RAWS_cleanInput($('#RA_LName')[0].value);
	RA_CtrlWin.RA.RAif.vars['Password'] = RAWS_cleanInput($('#RA_Password')[0].value);
	RA_CtrlWin.RA.RAif.vars['Password_confirm'] = RAWS_cleanInput($('#RA_Password_confirm')[0].value);

	var xHint = RAWS_cleanInput($('#RA_Password')[0].value);
	xHint = xHint.substring(0,1) +' '+ xHint.substring(1,xHint.length-2) +' '+  xHint.substring(xHint.length-2);
	RA_CtrlWin.RA.RAif.vars['sHintPwd'] = xHint;

	$('#RA_formError_register').hide('','');
	RA_CtrlWin.RA.RAif.vars['Error'] = '';
	$('#RA_FName_error').hide('','');
	$('#RA_LName_error').hide('','');
	$('#RA_Password_error').hide('','');
	$('#RA_Email_confirm_error').hide('','');
	$('#RA_Password_confirm_error').hide('','');
	if (RA_CtrlWin.RA.RAif.vars['FName']=='') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'All fields are required. Please fill them all in.';
		$('#RA_FName_error').show('','');
	}
	if (RA_CtrlWin.RA.RAif.vars['LName']=='') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'All fields are required. Please fill them all in.';
		$('#RA_LName_error').show('','');
	}
	if (RA_CtrlWin.RA.RAif.vars['Email_confirm']=='') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'All fields are required. Please fill them all in.';
		$('#RA_Email_confirm_error').show('','');
	}
	if (RA_CtrlWin.RA.RAif.vars['Password']=='') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'All fields are required. Please fill them all in.';
		$('#RA_Password_error').show('','');
	}
	if (RA_CtrlWin.RA.RAif.vars['Password_confirm']=='') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'All fields are required. Please fill them all in.';
		$('#RA_Password_confirm_error').show('','');
	}
	if (RA_CtrlWin.RA.RAif.vars['Error']!='') {
		$('#RA_formError_register').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_register').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if (RA_CtrlWin.RA.RAif.vars['Email']!=RA_CtrlWin.RA.RAif.vars['Email_confirm']) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'The e-mail addresses you entered do not match. Make sure you have spelled it correctly and try again.';
		$('#RA_formError_register').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_register').show('','');
		$('#RA_Email_confirm_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if (RA_CtrlWin.RA.RAif.vars['Password']==RA_CtrlWin.RA.RAif.vars['Email'].substring(0,RA_CtrlWin.RA.RAif.vars['Email'].indexOf('@'))) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Sorry, your password cannot match your e-mail address. Please choose a more secure password.';
		$('#RA_formError_register').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_register').show('','');
		$('#RA_Password_confirm_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if (RA_CtrlWin.RA.RAif.vars['Password']!=RA_CtrlWin.RA.RAif.vars['Password_confirm']) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'The passwords you entered do not match. Please try again.';
		$('#RA_formError_register').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_register').show('','');
		$('#RA_Password_confirm_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	RA_Register();
}

function RA_Register () {
//alert(RA_CtrlWin.RA.RAif.vars['Email'] +' / '+ RA_CtrlWin.RA.RAif.vars['Password'])
	RA_CtrlWin.RA.RAif.state.push('registering');
	RA_DrawPage();

	RA_CtrlWin.RA.RAWS.Send( RA_Register_0_go, RAWS1_StudentRegistration, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['Email'], 'sUserFirstName='+RA_CtrlWin.RA.RAif.vars['FName'], 'sUserLastName='+RA_CtrlWin.RA.RAif.vars['LName'], 'sUserPwd='+RA_CtrlWin.RA.RAif.vars['Password'], 'sVerifyPwd='+RA_CtrlWin.RA.RAif.vars['Password_confirm'], 'sUserPwdHint='+RA_CtrlWin.RA.RAif.vars['sHintPwd'], 'sRemoteIPAddr=chad faking', 'sBaseURL='+RA_CtrlWin.RA.CurrentSite.BaseURL, 'sInstructorEmail='  ) );
}
function RA_Register_0_go () {
	RA_Register_0();
}
function RA_Register_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
	if ( RA_CtrlWin.RAWS_error=='' && RA_CtrlWin.RAWS_iUserID>0 ) {
//alert( 'RA_CtrlWin.RAWS_iUserID --- '+ RA_CtrlWin.RAWS_iUserID );
		RAXS_Login_continue(RA_CtrlWin.RAWS_iUserID, 'registered');
//		if ($('#RA_Register_rememberMe')[0].checked) {
//			RA_ControlWindow.RARememberMe = 1;
//		}
	} else {
if (RA_CtrlWin.RA.dev_check()) alert( 'error iUserID('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_DrawPage();
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		$('#RA_formError_register').show('','');
		$('#RA_formError_register').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	}
}

//  ********************************************************************************

function RA_CodeYesLogin () {
	RA_CtrlWin.RA.RAif.state.push('login');
	RA_DrawPage();
}

function RA_CodeNoReg () {
	RA_CtrlWin.RA.RAif.state.push('checkemail');
	RA_DrawPage();
}

function RA_CodeContinue () {
	if (RA_CtrlWin.RA.CurrentUser!=null) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('assignusercodes');
		RA_goAssignUserCodes();
	} else {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('doassignusercodes');
		RA_CtrlWin.RA.RAif.state.push('checkemail');
	}
	RA_DrawPage();
}

function RA_goCheckCode () {
	if (!RA_CtrlWin.RA.RAif.vars['UnlockProducts']) {
		RA_CtrlWin.RA.RAif.vars['UnlockProducts'] = new Object();
		RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes'] = new Object();
		RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'] = 0;
	}
	RA_CtrlWin.RA.RAif.vars['Code'] = RAWS_cleanInput($('#RA_Code')[0].value);
	if (RA_CtrlWin.RA.RAif.vars['Code']=='') {
		RA_CtrlWin.RA.RAif.vars['Error'] = '<p>Enter the activation code printed on your access card and we\'ll check it for you.</p>';
		$('#RA_formError_checkcode').show('','');
		$('#RA_formError_checkcode').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
		return;
	}
	RA_CheckCode();
}

function RA_CheckCode () {
//alert(RA_CtrlWin.RA.RAif.vars['Email'] +' / '+ RA_CtrlWin.RA.RAif.vars['Password'])
	RA_CtrlWin.RA.RAif.state.push('checkingcode');
	RA_DrawPage();
	var tmpSiteIDs = '';
	var tmpSiteIDs_ct = 0;
	for (var iprod in RA_CtrlWin.RA.Products) {if (RA_CtrlWin.RA.Products.hasOwnProperty(iprod)) {
		switch (RA_CtrlWin.RA.Products[iprod].Type) {
		case 'RA SITE' :
			tmpSiteIDs_ct ++;
			if (tmpSiteIDs_ct > 1) tmpSiteIDs += ',';
			tmpSiteIDs += RA_CtrlWin.RA.Products[iprod].TypeObj.ID;
			break;
		case 'RA PACKAGE SITE' :
			tmpSiteIDs_ct ++;
			if (tmpSiteIDs_ct > 1) tmpSiteIDs += ',';
			tmpSiteIDs += RA_CtrlWin.RA.Products[iprod].TypeObj.ID;
			break;
/*
		case 'RA PACKAGE' :
			for (var isite in RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments) {if (RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments.hasOwnProperty(isite)) {
				tmpSiteIDs_ct ++;
				var tmpID = RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments[isite].Site.ID;
				if (tmpSiteIDs_ct > 1) tmpSiteIDs += ',';
				tmpSiteIDs += tmpID;
			}}
			break;
*/
		}
	}}
	if (RA_CtrlWin.RA.CurrentUser!=null) {
		RA_CtrlWin.RA.RAWS.Send( RA_CheckCode_0_go, RAWS3_CheckActivationCode, new Array( 'sActivationCode='+RA_CtrlWin.RA.RAif.vars['Code'], 'sSiteIDs='+tmpSiteIDs, 'iUserID='+RA_CtrlWin.RA.CurrentUser.ID ) );
	} else {
		RA_CtrlWin.RA.RAWS.Send( RA_CheckCode_0_go, RAWS3_CheckActivationCode, new Array( 'sActivationCode='+RA_CtrlWin.RA.RAif.vars['Code'], 'sSiteIDs='+tmpSiteIDs, 'iUserID=' ) );
	}
}
function RA_CheckCode_0_go () {
	RA_CheckCode_0();
}
function RA_CheckCode_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
//alert( 'CheckCode_0 ('+ RA_CtrlWin.RAWS_iPackageID +') --- '+ RA_CtrlWin.RAWS_error );
	if ( RA_CtrlWin.RAWS_error=='' ) {
//BCSv3_ebook_EW4e_PS: r6-3aj-48c4dz6a
//bcs_bsm_rewritingplus_PS: f4-y6-48c4emyc
//both: wi-3fk-4ege7y8c
//DEV both: mx-32w-3tjukja9
//DEV BCSv3_ebook_EW4e_PS: my-32x-3tjunqb2
//DEV bcs_bsm_rewritingplus_PS: f4-y6-3tjumm9x
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('checkedcode');

		for (var iprod in RA_CtrlWin.RA.Products) {if (RA_CtrlWin.RA.Products.hasOwnProperty(iprod)) {

		switch (RA_CtrlWin.RA.Products[iprod].Type) {
		case 'RA SITE' :
			for (var isite in RA_CtrlWin.RAWS_arrSiteIDs) {if (RA_CtrlWin.RAWS_arrSiteIDs.hasOwnProperty(isite)) {
if (false && RA_CtrlWin.RA.dev_check()) {
var mstr = ''
mstr += '\n prod id:';
mstr += RA_CtrlWin.RA.Products[iprod].ID;
mstr += '\n access:';
mstr += RA_CtrlWin.RA.Products[iprod].CurrentUserAccess()
mstr += '\n isite:';
mstr += isite;
mstr += '\n RAWS site arr:';
mstr += RA_CtrlWin.RAWS_arrSiteIDs;
mstr += '\n RAWS site id:';
mstr += RA_CtrlWin.RAWS_arrSiteIDs[isite];
alert( mstr );
}
			if (RA_CtrlWin.RA.Sites[RA_CtrlWin.RAWS_arrSiteIDs[isite]] && RA_CtrlWin.RA.Products[iprod].TypeObj.ID == RA_CtrlWin.RAWS_arrSiteIDs[isite]) {
				if (RA_CtrlWin.RA.Products[iprod].CurrentUserAccess() <= 20) {
					RA_CtrlWin.RA.RAif.vars['UnlockProducts'][RA_CtrlWin.RA.Products[iprod].ID] = RA_CtrlWin.RA.Products[iprod];
						RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes'][RA_CtrlWin.RA.Products[iprod].ID] = RA_CtrlWin.RA.RAif.vars['Code'];
						RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'] += 1;
				}
			}
			}}
			break;
		case 'RA PACKAGE' :
//DEV henretta: 33f-3qh-62gcct6b
var mstr = ''
mstr += '\n prod id:';
mstr += RA_CtrlWin.RA.Products[iprod].ID;
mstr += '\n access:';
mstr += RA_CtrlWin.RA.Products[iprod].CurrentUserAccess()
			var yesAll = true;
			var tmpIDsStr = ',';
			for (var isite in RA_CtrlWin.RAWS_arrSiteIDs) {if (RA_CtrlWin.RAWS_arrSiteIDs.hasOwnProperty(isite)) {
				tmpIDsStr += RA_CtrlWin.RAWS_arrSiteIDs[isite] +',';
mstr += '\n isite:';
mstr += isite;
mstr += '\n RAWS site arr:';
mstr += RA_CtrlWin.RAWS_arrSiteIDs;
mstr += '\n RAWS site id:';
mstr += RA_CtrlWin.RAWS_arrSiteIDs[isite];
				if (!RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments[RA_CtrlWin.RAWS_arrSiteIDs[isite]]) {
					yesAll = false;
				}
			}}
mstr += '\n yes all 1:';
mstr += yesAll;
mstr += '\n tmpIDsStr:';
mstr += tmpIDsStr;
			for (var isite2 in RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments) {if (RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments.hasOwnProperty(isite2)) {
				var tmpID = RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments[isite2].Site.ID;
mstr += '\n isite2:';
mstr += isite2;
mstr += '\n tmpID:';
mstr += tmpID;
mstr += '\n tmpIDsStr indexOf tmpID:';
mstr += tmpIDsStr.indexOf(','+tmpID+',');
				if (tmpIDsStr.indexOf(','+tmpID+',')==-1) {
					yesAll = false;
				}
			}}
mstr += '\n yes all 2:';
mstr += yesAll;
if (false && RA_CtrlWin.RA.dev_check()) {
alert( mstr );
}
			if (yesAll && RA_CtrlWin.RA.Products[iprod].CurrentUserAccess() <= 20) {
				RA_CtrlWin.RA.RAif.vars['UnlockProducts'][RA_CtrlWin.RA.Products[iprod].ID] = RA_CtrlWin.RA.Products[iprod];
				RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes'][RA_CtrlWin.RA.Products[iprod].ID] = RA_CtrlWin.RA.RAif.vars['Code'];
				RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'] += 1;
			}
/*
			for (var isite2 in RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments) {if (RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments.hasOwnProperty(isite2)) {
				var tmpID = RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments[isite2].Site.ID;
if (RA_CtrlWin.RA.dev_check()) {
var mstr = ''
mstr += '\n prod id:';
mstr += RA_CtrlWin.RA.Products[iprod].ID;
mstr += '\n access:';
mstr += RA_CtrlWin.RA.Products[iprod].CurrentUserAccess()
mstr += '\n isite:';
mstr += isite;
mstr += '\n RAWS site arr:';
mstr += RA_CtrlWin.RAWS_arrSiteIDs;
mstr += '\n RAWS site id:';
mstr += RA_CtrlWin.RAWS_arrSiteIDs[isite];
mstr += '\n isite2:';
mstr += isite2;
mstr += '\n prod site id:';
mstr += RA_CtrlWin.RA.Products[iprod].TypeObj.SiteAssignments[isite2].Site.ID;
alert( mstr );
}
				if (RA_CtrlWin.RA.Sites[RA_CtrlWin.RAWS_arrSiteIDs[isite]] && tmpID == RA_CtrlWin.RAWS_arrSiteIDs[isite]) {
					if (RA_CtrlWin.RA.Products[iprod].CurrentUserAccess() <= 20) {
						RA_CtrlWin.RA.RAif.vars['UnlockProducts'][RA_CtrlWin.RA.Products[iprod].ID] = RA_CtrlWin.RA.Products[iprod];
						RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes'][RA_CtrlWin.RA.Products[iprod].ID] = RA_CtrlWin.RA.RAif.vars['Code'];
						RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'] += 1;
					}
				}
			}}
*/
			break;
		}
/*
				if (RA_CtrlWin.RA.Products[iprod].CurrentUserAccess() <= 20 && RA_CtrlWin.RA.Products[iprod].Type == 'RASite') {
					if (RA_CtrlWin.RA.Sites[RA_CtrlWin.RAWS_arrSiteIDs[isite]] && RA_CtrlWin.RA.Products[iprod].TypeObj.ID == RA_CtrlWin.RAWS_arrSiteIDs[isite]) {
						RA_CtrlWin.RA.RAif.vars['UnlockProducts'][RA_CtrlWin.RA.Products[iprod].ID] = RA_CtrlWin.RA.Products[iprod];
						RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes'][RA_CtrlWin.RA.Products[iprod].ID] = RA_CtrlWin.RA.RAif.vars['Code'];
						RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'] += 1;
					}
				}
*/
		}}
		delete RA_CtrlWin.RA.RAif.vars['Error'];
		delete RA_CtrlWin.RA.RAif.vars['Code'];
//alert( 'pct --- '+ RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'] );
		RA_DrawPage();
	} else {
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );

		if (RA_CtrlWin.RAWS_error=='Invalid input: no sActivationCode') {

			RA_CtrlWin.RA.RAif.vars['Error'] = '<p>Enter the activation code printed on your access card and we\'ll check it for you.</p>';

		} else if (RA_CtrlWin.RAWS_error=='CodeInvalidFormat' || RA_CtrlWin.RAWS_error=='CodeNotFound' || RA_CtrlWin.RAWS_error=='CodeFailsSumCheck') {

			RA_CtrlWin.RA.RAif.vars['Error'] = 'There\'s a problem with the code you entered. Check that you entered the code exactly as it appears on your access card and try again.';

		} else if (RA_CtrlWin.RAWS_error=='CodeNoUsesLeft') {

			RA_CtrlWin.RA.RAif.vars['Error'] = 'That code is all used up! Check that you entered the same code on your access card and try again. If you get this message again, contact tech support.';

		} else if (RA_CtrlWin.RAWS_error=='CodeUseByDateExpired' || RA_CtrlWin.RAWS_error=='CodeExpiredAbsolute' || RA_CtrlWin.RAWS_error=='CodeExpiredRelative' || RA_CtrlWin.RAWS_error=='BatchSuspended') {

			RA_CtrlWin.RA.RAif.vars['Error'] = 'The code you entered has expired. Contact tech support.';

		} else if (RA_CtrlWin.RAWS_error=='PackageAlreadyAssignedToUser') {

			RA_CtrlWin.RA.RAif.vars['Error'] = 'You already have access to the resources unlocked by this code. If you are experiencing problems with your access, contact tech support.';
//alert(RA_CtrlWin.RAWS_iPackageID +' - '+ RA_CtrlWin.RA.Packages[RA_CtrlWin.RAWS_iPackageID]);
			if (RA_CtrlWin.RA.Packages[RA_CtrlWin.RAWS_iPackageID]) {
				var pstr = RA_CtrlWin.RA.Packages[RA_CtrlWin.RAWS_iPackageID].DisplayAll('form');
				RA_CtrlWin.RA.RAif.vars['Error'] += pstr;
			}

		} else if (RA_CtrlWin.RAWS_error=='Invalid input: no CheckActivationCode element' || RA_CtrlWin.RAWS_error=='Invalid input: no sPackageIDs' || RA_CtrlWin.RAWS_error=='Invalid input: no iSiteID' || RA_CtrlWin.RAWS_error=='Invalid input: no iUserID' || RA_CtrlWin.RAWS_error=='BatchNotFound' || RA_CtrlWin.RAWS_error=='CodeNotValidForPackages' || RA_CtrlWin.RAWS_error=='CodeNotValidForSite' || RA_CtrlWin.RAWS_error=='CodeNotValidForAnySites') {

			RA_CtrlWin.RA.RAif.vars['Error'] = 'An error as occurred. Please contact tech support.  (error code: '+ RA_CtrlWin.RAWS_error +')';

		} else {

			RA_CtrlWin.RA.RAif.vars['Error'] = 'An error as occurred. Please contact tech support.  (error code: '+ RA_CtrlWin.RAWS_error +')';

		}

		RA_DrawPage();
		$('#RA_formError_checkcode').show('','');
		$('#RA_formError_checkcode').html('');
		$('#RA_formError_checkcode').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	}
}

//  ********************************************************************************

function RA_goAssignUserCodes () {
	if (!RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes']) {
alert('no codes!');
	}
	RA_AssignUserCodes();
}

function RA_AssignUserCodes () {
//alert(RA_CtrlWin.RA.RAif.vars['Email'] +' / '+ RA_CtrlWin.RA.RAif.vars['Password'])
	RA_CtrlWin.RA.RAif.state.push('assigningusercodes');
	RA_DrawPage();
	var strcodes = '';
	for (var i in RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes']) {if (RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes'].hasOwnProperty(i)) {
		if (strcodes!='') {
			strcodes += ',';
		}
		strcodes += RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes'][i];
	}}
	RA_CtrlWin.RA.RAWS.Send( RA_AssignUserCodes_0_go, RAWS3_AssignUserCodes, new Array( 'sActivationCodes='+strcodes, 'iUserID='+RA_CtrlWin.RA.CurrentUser.ID ) );
}
function RA_AssignUserCodes_0_go () {
	RA_AssignUserCodes_0();
}
function RA_AssignUserCodes_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
//BCSv3_ebook_EW4e_PS: r6-3aj-48c4dz6a
//bcs_bsm_rewritingplus_PS: f4-y6-48c4emyc
//both: wi-3fk-4ege7y8c
//DEV both: mx-32w-3tjukja9
//DEV BCSv3_ebook_EW4e_PS: my-32x-3tjunqb2
//DEV bcs_bsm_rewritingplus_PS: f4-y6-3tjumm9x
	if ( RA_CtrlWin.RAWS_error=='' ) {
		RAif_RAXS_ReInit('assignedusercodes');
	} else {
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );

		if (RA_CtrlWin.RAWS_error=='PackageAlreadyAssignedToUser') {

			RA_CtrlWin.RA.RAif.vars['Error'] = 'You already have access to the resources unlocked by this code. Click "continue" to access your resources. If you are experiencing problems with your access, contact tech support.';
			for (var i in RA_CtrlWin.RAWS_udtPackages) {if (RA_CtrlWin.RAWS_udtPackages.hasOwnProperty(i)) {
				var pstr = RA_CtrlWin.RA.Packages[RA_CtrlWin.RAWS_udtPackages[i].PackageID].DisplayAll('form');
				RA_CtrlWin.RA.RAif.vars['Error'] += pstr;
			}}
//alert(RA_CtrlWin.RAWS_iPackageID +' - '+ RA_CtrlWin.RA.Packages[RA_CtrlWin.RAWS_iPackageID]);
			if (RA_CtrlWin.RA.Packages[RA_CtrlWin.RAWS_iPackageID]) {
				var pstr = RA_CtrlWin.RA.Packages[RA_CtrlWin.RAWS_iPackageID].DisplayAll('form');
				RA_CtrlWin.RA.RAif.vars['Error'] += pstr;
			}
		} else {
			RA_CtrlWin.RA.RAif.vars['Error'] = 'An error as occurred. Please contact tech support.  (error code: '+ RA_CtrlWin.RAWS_error +')';
		}

		RA_DrawPage();
		$('#RA_formError_assignusercodes').show('','');
		$('#RA_formError_assignusercodes').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	}
}

//  ********************************************************************************

function RA_CodeOrCardPromptYes () {
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('checkcode');
	RA_DrawPage();
	RAif_Resize();
//window.self.focus();
}

function RA_CodeOrCardPromptNo () {
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('cart');
	RA_DrawPage();
	RAif_Resize();
//window.self.focus();
}

//  ********************************************************************************

function RA_AddToCart (pid,cartItemId) {
	for (var jitem in RA_CtrlWin.RA.Cart.Items) {if (RA_CtrlWin.RA.Cart.Items.hasOwnProperty(jitem)) {
		var item2 = RA_CtrlWin.RA.Cart.Items[jitem];
		if (pid == item2.Product.ID && item2.InCart) {
			var x = RA_CtrlWin.RA.Cart.RemoveItem(item2.Product.ID,item2.ItemID);
		}
	}}
	var x = RA_CtrlWin.RA.Cart.AddItem(pid,cartItemId);
	RA_DrawPage();
}

function RA_RemoveFromCart (pid,cartItemId) {
	var x = RA_CtrlWin.RA.Cart.RemoveItem(pid,cartItemId);
	RA_DrawPage();
}

function RA_BackToCart () {
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('cart');
	RA_DrawPage();
	if (RA_CtrlWin.RA.RAif.vars['Error'] && RA_CtrlWin.RA.RAif.vars['Error'] != '') {
		$('#RA_formError_cart').show('','');
	}
	RAif_Resize();
//window.self.focus();
}

function RA_GoCartCheckOut () {
	if (RA_CtrlWin.RA.Cart.Items_InCart_ct>0) {
		if (RA_CtrlWin.RA.CurrentUser!=null) {
//alert('check out!');
			if (!RA_CtrlWin.RA.CurrentUser.School) {
				RA_CtrlWin.RA.RAif.state.pop();
				RA_CtrlWin.RA.RAif.state.push('checkoutschoolprompt');
				RA_DrawPage();
				RAif_Resize();
//window.self.focus();
			} else {
				RA_CtrlWin.RA.RAif.state.pop();
				RA_CtrlWin.RA.RAif.state.push('checkoutprompt');
				RA_DrawPage();
				RAif_Resize();
//window.self.focus();
			}
		} else {
			RA_CtrlWin.RA.RAif.state.pop();
			RA_CtrlWin.RA.RAif.state.push('docheckout');
			RA_CtrlWin.RA.RAif.state.push('checkemail');
			RA_DrawPage();
			RAif_Resize();
//window.self.focus();
		}
	} else {
alert('Your cart is empty')
	}
}

function RA_CartCheckItems () {
	var foundInCart = false;
	for (var item in RA_CtrlWin.RA.Cart.Items) {if (RA_CtrlWin.RA.Cart.Items.hasOwnProperty(item)) {
		if (RA_CtrlWin.RA.Cart.Items[item].InCart && RA_CtrlWin.RA.Cart.Items[item].Product.CurrentUserAccess() >= RA_CtrlWin.RA.Cart.Items[item].LevelOfAccess) {
			var x = RA_CtrlWin.RA.Cart.RemoveItem(RA_CtrlWin.RA.Cart.Items[item].Product.ID, RA_CtrlWin.RA.Cart.Items[item].ItemID);
			foundInCart = true;
		}
	}}
	if (foundInCart) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'You already have access to one or more items in your cart. We\'ve removed these items. Please review your updated selections below.'; //'
		RAif_timeout = setTimeout('RA_BackToCart()', 5);
	} else {
		RAif_timeout = setTimeout('RA_GoCartCheckOut()', 5);
	}
}

function RA_CheckOut () {
	RA_CtrlWin.RA.RAif.vars['Error'] = '';
	RA_CtrlWin.RA.RAif.state.push('checkingout');
	RA_DrawPage();
	RAif_Resize();
//window.self.focus();
	RA_checkout_win = window.open( 'cart_start.html', 'RA_checkout_win','location=no,menubar=no,scrollbars=yes,titlebar=no,toolbar=no' );
}

function RA_CartFinishCheckOut () {
	if (RA_CtrlWin.RA.Cart.Items_InCart_ct>0) {
//alert('check out!');
		RA_CtrlWin.RA.RAif.state.pop();
		RAif_RAXS_ReInit('checkedout');
	} else {
alert('Your cart is empty')
	}
}

//  ********************************************************************************

function RA_goCheckOutLookupSchool () {
	if (RA_CtrlWin.RA.RAif.vars['Schools'].length == 0) {
		RA_goCheckOutLookupSchool1();
	} else {
		var x = document.getElementsByName('RA_SchoolType');
		var y = RA_CtrlWin.RA.RAif.vars['SchoolType'];
		for (var i=0; i<x.length; i++) {
			if (x[i].checked) {
				y = x[i].value;
			}
		}
		if (y != RA_CtrlWin.RA.RAif.vars['SchoolType']) {
			RA_goCheckOutLookupSchool1();
			return;
		}
		if ($('#RA_iZip')[0].value.replace('-','') != RA_CtrlWin.RA.RAif.vars['iZip']) {
			RA_goCheckOutLookupSchool1();
			return;
		}
		var w = $('#RA_School')[0];
		if (w.selectedIndex == -1) {
			RA_CtrlWin.RA.RAif.vars['Error'] = 'Please select your institution from the list below.';
			$('#RA_formError_checkoutschoolprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
			$('#RA_formError_checkoutschoolprompt').show('','');
			RAif_Resize();
//window.self.focus();
			return;
		}
		RA_CtrlWin.RA.CurrentUser.School = new Object();
		RA_CtrlWin.RA.CurrentUser.School.ID = RA_CtrlWin.RA.RAif.vars['Schools'][w.options[w.selectedIndex].value].ID;
		RA_CtrlWin.RA.CurrentUser.School.Name = RA_CtrlWin.RA.RAif.vars['Schools'][w.options[w.selectedIndex].value].Name;
		RA_CtrlWin.RA.CurrentUser.School.Country = RA_CtrlWin.RA.RAif.vars['Schools'][w.options[w.selectedIndex].value].Country;
		RA_CtrlWin.RA.CurrentUser.School.StateAbbr = RA_CtrlWin.RA.RAif.vars['Schools'][w.options[w.selectedIndex].value].StateAbbr;
		RA_CtrlWin.RA.CurrentUser.School.City = RA_CtrlWin.RA.RAif.vars['Schools'][w.options[w.selectedIndex].value].City;
		RA_CtrlWin.RA.CurrentUser.School.Zip = RA_CtrlWin.RA.RAif.vars['Schools'][w.options[w.selectedIndex].value].Zip;
		RA_CtrlWin.RA.CurrentUser.School.Type = RA_CtrlWin.RA.RAif.vars['Schools'][w.options[w.selectedIndex].value].Type;
		RA_GoCartCheckOut();
	}
}
function RA_goCheckOutLookupSchool1 () {
	var x = document.getElementsByName('RA_SchoolType');
	for (var i=0; i<x.length; i++) {
		if (x[i].checked) {
			RA_CtrlWin.RA.RAif.vars['SchoolType'] = x[i].value;
		}
	}
	if (RA_CtrlWin.RA.RAif.vars['SchoolType'] == '') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please select whether your institution is a "college" or a "high school".';
		$('#RA_formError_checkoutschoolprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_checkoutschoolprompt').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if ($('#RA_iZip')[0].value == '') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Enter the zip code of your college, university, or high school.';
		$('#RA_formError_checkoutschoolprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_checkoutschoolprompt').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	var z = new Number( RAWS_cleanInput($('#RA_iZip')[0].value.replace('-','')) );
	if (isNaN(z)) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'You entered an invalid zip code. Please Enter the zip code of your college, university, or high school.';
		$('#RA_formError_checkoutschoolprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_checkoutschoolprompt').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	RA_CtrlWin.RA.RAif.vars['iZip'] = RAWS_cleanInput($('#RA_iZip')[0].value.replace('-',''));
	RA_CheckOutLookupSchool();
}

function RA_CheckOutLookupSchool () {
	RA_CtrlWin.RA.RAif.state.push('checkoutlookingupschool');
	RA_DrawPage();
	RA_CtrlWin.RA.RAWS.Send( RA_CheckOutLookupSchool_0_go, RAWS3_GetOnyxSchoolsByZip, new Array( 'iZipPrefix='+RA_CtrlWin.RA.RAif.vars['iZip'], 'sSchoolType='+RA_CtrlWin.RA.RAif.vars['SchoolType'] ) );
}
function RA_CheckOutLookupSchool_0_go () {
	RA_CheckOutLookupSchool_0();
}
function RA_CheckOutLookupSchool_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
	if ( RA_CtrlWin.RAWS_error=='' ) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('checkoutschoolprompt');
		RA_CtrlWin.RA.RAif.vars['Schools'] = new Array();
		for (var i in RA_CtrlWin.RAWS_udtSchools) {if (RA_CtrlWin.RAWS_udtSchools.hasOwnProperty(i)) {
			RA_CtrlWin.RA.RAif.vars['Schools'][RA_CtrlWin.RA.RAif.vars['Schools'].length] = RA_CtrlWin.RAWS_udtSchools[i];
		}}
		RA_DrawPage();
		RAif_Resize();
		$('#RA_formError_checkoutschoolprompt').show();
//window.self.focus();
	} else {
		if (RA_CtrlWin.RAWS_error == 'SchoolNotFound') {
			RA_DrawPage();
			RA_CtrlWin.RA.RAif.vars['Error'] = 'We couldn\'t find any schools in that zip code.';
			$('#RA_formError_checkoutschoolprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
			$('#RA_formError_checkoutschoolprompt').show();
//			RA_DrawPage();
			RAif_Resize();
//window.self.focus();
		} else {
			RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
			RA_DrawPage();
			$('#RA_formError_checkoutschoolprompt').show('','');
			$('#RA_formError_checkoutschoolprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
			RA_DrawPage();
			RAif_Resize();
//window.self.focus();
		}
	}
}

function RA_goCheckOutSelectSchool () {
//		RA_GoCartCheckOut();
}

//  ********************************************************************************

function RA_doChangeEmail () {
	$('#RA_editLogin').show('','');
	$('#RA_editEmail').show('','');
	$('#RA_showEmail').hide('','');
	RA_ChangingEmail=true;
	RAif_Resize();
//window.self.focus();
}

function RA_doChangePw () {
	$('#RA_editLogin').show('','');
	$('#RA_changePw').show('','');
	$('#RA_showPw').hide('','');
	RA_ChangingPw=true;
	RAif_Resize();
//window.self.focus();
}

function RA_goUpdateProfile () {

	$('#RA_formError_updateprofile').hide('','');
	$('#RA_sUserFirstName_error').hide('','');
	$('#RA_sUserLastName_error').hide('','');
	$('#RA_sUserEmail_error').hide('','');
	$('#RA_sUserEmail_confirm_error').hide('','');
	$('#RA_sOldPwd_error').hide('','');
	$('#RA_sNewPwd_error').hide('','');
	$('#RA_sVPwd_error').hide('','');
	if ($('#RA_sUserFirstName')[0].value == '') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please enter your first name.';
		$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_updateprofile').show('','');
		$('#RA_sUserFirstName_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if ($('#RA_sUserLastName')[0].value == '') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please enter your last name.';
		$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_updateprofile').show('','');
		$('#RA_sUserLastName_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if (RA_ChangingEmail && $('#RA_sUserEmail')[0].value == '') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please choose your new e-mail address.';
		$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_updateprofile').show('','');
		$('#RA_sUserEmail_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if (RA_ChangingEmail && $('#RA_sUserEmail')[0].value != $('#RA_sUserEmail_confirm')[0].value) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please confirm your new e-mail address.';
		$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_updateprofile').show('','');
		$('#RA_sUserEmail_confirm_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if (RA_ChangingPw && $('#RA_sOldPwd')[0].value == '') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please confirm your current password.';
		$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_updateprofile').show('','');
		$('#RA_sOldPwd_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if (RA_ChangingPw && $('#RA_sNewPwd')[0].value == '') {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please choose your new password.';
		$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_updateprofile').show('','');
		$('#RA_sNewPwd_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}
	if (RA_ChangingPw && $('#RA_sNewPwd')[0].value != $('#RA_sVPwd')[0].value) {
		RA_CtrlWin.RA.RAif.vars['Error'] = 'Please confirm your new password.';
		$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
		$('#RA_formError_updateprofile').show('','');
		$('#RA_sVPwd_error').show('','');
		RAif_Resize();
//window.self.focus();
		return;
	}

	RA_CtrlWin.RA.RAif.vars['iUserID'] = RA_CtrlWin.RA.CurrentUser.ID;
	RA_CtrlWin.RA.RAif.vars['sUserEmail'] = RAWS_cleanInput($('#RA_sUserEmail')[0].value);
	RA_CtrlWin.RA.RAif.vars['sInstructorEmail'] = '';
	RA_CtrlWin.RA.RAif.vars['sUserFirstName'] = RAWS_cleanInput($('#RA_sUserFirstName')[0].value);
	RA_CtrlWin.RA.RAif.vars['sUserLastName'] = RAWS_cleanInput($('#RA_sUserLastName')[0].value);
//	RA_CtrlWin.RA.RAif.vars['sMailPreferences'] = 'TEXT';
//	RA_CtrlWin.RA.RAif.vars['sOptInEmail'] = 0;
	RA_CtrlWin.RA.RAif.vars['sBaseURL'] = RA_CtrlWin.RA.CurrentSite.BaseURL;
	RA_CtrlWin.RA.RAif.vars['sUserName'] = RAWS_cleanInput($('#RA_sUserEmail')[0].value);
	RA_CtrlWin.RA.RAif.vars['sOldPwd'] = RAWS_cleanInput($('#RA_sOldPwd')[0].value);
	RA_CtrlWin.RA.RAif.vars['sNewPwd'] = RAWS_cleanInput($('#RA_sNewPwd')[0].value);
	RA_CtrlWin.RA.RAif.vars['sVPwd'] = RAWS_cleanInput($('#RA_sVPwd')[0].value);
	var xHint = RAWS_cleanInput($('#RA_sNewPwd')[0].value);
	xHint = xHint.substring(0,1) +' '+ xHint.substring(1,xHint.length-2) +' '+  xHint.substring(xHint.length-2);
	RA_CtrlWin.RA.RAif.vars['sHintPwd'] = xHint;
	RA_UpdateProfile();
}

function RA_UpdateProfile () {
	RA_CtrlWin.RA.RAif.state.push('updatingprofile');
	RA_DrawPage();
	RA_CtrlWin.RA.RAWS.Send( RA_UpdateProfile_0_go, RAWS1_UpdateProfile, new Array( 'iUserID='+RA_CtrlWin.RA.RAif.vars['iUserID'], 'sUserEmail='+RA_CtrlWin.RA.RAif.vars['sUserEmail'], 'sInstructorEmail='+RA_CtrlWin.RA.RAif.vars['sInstructorEmail'], 'sUserFirstName='+RA_CtrlWin.RA.RAif.vars['sUserFirstName'], 'sUserLastName='+RA_CtrlWin.RA.RAif.vars['sUserLastName'], 'sBaseURL='+RA_CtrlWin.RA.RAif.vars['sBaseURL'] ) );
}
function RA_UpdateProfile_0_go () {
	RA_UpdateProfile_0();
}
function RA_UpdateProfile_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
	if ( RA_CtrlWin.RAWS_error=='' ) {
		if (RA_ChangingPw) {
//alert(1);
			RA_CtrlWin.RA.RAif.state.push('updatingprofile');
			RA_DrawPage();
			RA_CtrlWin.RA.RAWS.Send( RA_UpdateProfile_1_go, RAWS1_UpdatePassword, new Array( 'iUserID='+RA_CtrlWin.RA.RAif.vars['iUserID'], 'sUserName='+RA_CtrlWin.RA.RAif.vars['sUserName'], 'sOldPwd='+RA_CtrlWin.RA.RAif.vars['sOldPwd'], 'sNewPwd='+RA_CtrlWin.RA.RAif.vars['sNewPwd'], 'sVPwd='+RA_CtrlWin.RA.RAif.vars['sVPwd'], 'sHintPwd='+RA_CtrlWin.RA.RAif.vars['sHintPwd'] ) );
		} else {
//alert(2);
			RAif_RAXS_ReInit('updatedprofile');
		}
	} else {
//alert(3);
		if ( RA_CtrlWin.RAWS_error == 'This User Email address already exists.') {
			RA_CtrlWin.RA.RAif.vars['Error'] = 'The e-mail address <b>'+ RA_CtrlWin.RA.RAif.vars['sUserEmail'] +'</b> is already registered.';
			RA_CtrlWin.RA.RAif.vars['sUserEmail'] = RA_CtrlWin.RA.CurrentUser.Email;
			RA_DrawPage();
			$('#RA_formError_updateprofile').show('','');
			$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
			RAif_Resize();
//window.self.focus();
		} else {
			RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
			RA_DrawPage();
			$('#RA_formError_updateprofile').show('','');
			$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
			RA_DrawPage();
			RAif_Resize();
//window.self.focus();
		}
	}
}
function RA_UpdateProfile_1_go () {
	RA_UpdateProfile_1();
}
function RA_UpdateProfile_1 () {
	RA_CtrlWin.RA.RAif.state.pop();
	if ( RA_CtrlWin.RAWS_error=='' ) {
//alert(4);
		RAif_RAXS_ReInit('updatedprofile');
	} else {
//alert(5);
		RA_DrawPage();
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		$('#RA_formError_updateprofile').show('','');
		$('#RA_formError_updateprofile').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	}
}

//  ********************************************************************************

function RA_reGoQuizPrompt () {
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('quizprompt');
//	RA_CtrlWin.RA.RAif.vars['sInstructorEmail'] = RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail = RA_CtrlWin.RA.RAif.vars['sInstructorEmail'];
	RA_DrawPage();
}

function RA_goQuizPrompt () {
//alert(RA_CtrlWin.RA.RAif.vars['sInstructorEmail'] +' --- '+ RAWS_cleanInput($('#RA_sInstructorEmail')[0].value));
	RA_CtrlWin.RA.RAif.vars['sInstructorEmail'] = RAWS_cleanInput($('#RA_sInstructorEmail')[0].value);
	if (RA_CtrlWin.RA.RAif.vars['sInstructorEmailSKIP'] != true && RA_CtrlWin.RA.RAif.vars['sInstructorEmail'] == '') {
		$('#RA_form_quizpromptInstrux').css('color','#ff0000');
	} else if (RA_CtrlWin.RA.RAif.vars['sInstructorEmail'] == RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail) {
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('quizprompted');
		RA_CtrlWin.RA.CurrentUser.ClassPrompt = 0;
		RA_CtrlWin.RA.RAif.updated = true;
		RA_CtrlWin.RA.RAif.vars['Error'] = '';
		RA_DrawPage();
		RAif_Resize();
//window.self.focus();
		RA_CtrlWin.RA.RAif.state.pop();
	} else if (RA_CtrlWin.RA.RAif.vars['sInstructorEmail'] == '') {
		RA_QuizPrompt_1();
	} else {
		RA_QuizPrompt();
	}
}

function RA_QuizPrompt () {
//if (RA_CtrlWin.RA.dev_check()) alert(RA_CtrlWin.RA.RAif.vars['sInstructorEmail'])
	RA_CtrlWin.RA.RAif.state.push('quizprompting');
	RA_DrawPage();
	RA_CtrlWin.RA.RAWS.Send( RA_QuizPrompt_0_go, RAWS1_GetUsernamePasswordHint, new Array( 'sUserName='+RA_CtrlWin.RA.RAif.vars['sInstructorEmail'], 'sBaseUrl=' ) );
}
function RA_QuizPrompt_0_go () {
	RA_QuizPrompt_0();
}
function RA_QuizPrompt_0 () {
//prompt( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
	if ( RA_CtrlWin.RAWS_error=='' ) {
		RA_QuizPrompt_1();
	} else if (RA_CtrlWin.RAWS_error=='User not found.') {
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.state.push('quizpromptBAD');
		RA_CtrlWin.RA.RAif.vars['Error'] = '';
		RA_DrawPage();
	} else {
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
		RA_CtrlWin.RA.RAif.state.pop();
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		RA_DrawPage();
		$('#RA_formError_quizprompt').show('','');
		$('#RA_formError_quizprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RAif_Resize();
//window.self.focus();
	}
}

function RA_QuizPromptBad1Yes () {
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('quizprompting');
	RA_DrawPage();
	RA_QuizPrompt_1();
}

function RA_QuizPromptBad1No () {
//alert( 'error 0 ('+ RA_CtrlWin.RAWS_iUserID +') --- '+ RA_CtrlWin.RAWS_error );
	RA_CtrlWin.RA.RAif.state.pop();
	RA_DrawPage();
}

function RA_QuizPrompt_1 () {
//alert(RA_CtrlWin.RA.RAif.vars['sInstructorEmail'])
	RA_CtrlWin.RA.RAWS.Send( RA_QuizPrompt_1_go, RAWS1_UpdateSiteLogin, new Array( 'iUserID='+RA_CtrlWin.RA.CurrentUser.ID, 'iSiteID='+RA_CtrlWin.RA.CurrentSite.ID, 'sInstructorEmail='+RA_CtrlWin.RA.RAif.vars['sInstructorEmail'], 'sIPAddr='+RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].LoggedOn ) );
}
function RA_QuizPrompt_1_go () {
	RA_QuizPrompt_2();
}
function RA_QuizPrompt_2 () {
	if (useRAWS3) {
		RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail = RA_CtrlWin.RA.RAif.vars['sInstructorEmail'];
		RA_QuizPrompt_3();
	} else {
		RA_CtrlWin.RA.RAif.state.pop();
//prompt('error',RA_CtrlWin.RAWS_error);
		if ( RA_CtrlWin.RAWS_error=='' ) {
			RA_CtrlWin.RA.CurrentUser.ClassPrompt = 0;
//			RAif_RAXS_ReInit('quizprompted');
			RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail = RA_CtrlWin.RA.RAif.vars['sInstructorEmail'];
			RA_CtrlWin.RA.RAif.updated = true;
			RA_FormContinue();
		} else {
			if ( RA_CtrlWin.RAWS_error == 'Please provide all required information.' || RA_CtrlWin.RAWS_error == 'Please enter email address.' ) {
				RA_CtrlWin.RA.RAif.state.push('quizprompted');
				RA_CtrlWin.RA.CurrentUser.ClassPrompt = 0;
				RA_CtrlWin.RA.RAif.updated = true;
				RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail = RA_CtrlWin.RA.RAif.vars['sInstructorEmail'];
				RA_CtrlWin.RA.RAif.vars['Error'] = '';
				RA_DrawPage();
				RAif_Resize();
	//window.self.focus();
				RA_CtrlWin.RA.RAif.state.pop();
			} else {
				RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
				RA_DrawPage();
				$('#RA_formError_quizprompt').show('','');
				$('#RA_formError_quizprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
				RA_DrawPage();
				RAif_Resize();
	//window.self.focus();
			}
		}
	}
}
function RA_QuizPrompt_3 () {
//alert(RA_CtrlWin.RA.RAif.vars['sInstructorEmail'])
	RA_CtrlWin.RA.RAWS.Send( RA_QuizPrompt_4_go, RAWS3_GetDefaultClass, new Array( 'sUserEmail='+RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail ) );
}
function RA_QuizPrompt_4_go () {
	RA_QuizPrompt_4();
}
function RA_QuizPrompt_4 () {
//prompt('error',RA_CtrlWin.RAWS_error);
	if ( RA_CtrlWin.RAWS_error=='' ) {
		RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].DefaultClassID = RA_CtrlWin.RAWS_iClassUsingClassID;
		RA_CtrlWin.RA.CurrentUser.ClassPrompt = 0;
		RA_CtrlWin.RA.RAif.updated = true;
		RA_QuizPrompt_5();
	} else {
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		RA_DrawPage();
		$('#RA_formError_quizprompt').show('','');
		$('#RA_formError_quizprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RA_DrawPage();
		RAif_Resize();
	}
}
function RA_QuizPrompt_5 () {
//alert(RA_CtrlWin.RA.RAif.vars['sInstructorEmail'])
	RA_CtrlWin.RA.RAWS.Send( RA_QuizPrompt_6_go, RAWS3_JoinUsertoClass, new Array( 'iUserID='+RA_CtrlWin.RA.CurrentUser.ID, 'iClassID='+RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].DefaultClassID ) );
//	RA_CtrlWin.RA.RAWS.Send( RA_QuizPrompt_6_go, RAWS3_JoinClass, new Array( 'iUserID='+RA_CtrlWin.RA.CurrentUser.ID, 'sClassCode='+RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail ) );
}
function RA_QuizPrompt_6_go () {
	RA_QuizPrompt_6();
}
function RA_QuizPrompt_6 () {
	RA_CtrlWin.RA.RAif.state.pop();
//prompt('error',RA_CtrlWin.RAWS_error);
	if ( RA_CtrlWin.RAWS_error=='' || RA_CtrlWin.RAWS_error=='User already member of class.' ) {
//alert('done!!!');
//alert(RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].DefaultClassID);
		RA_FormContinue();
	} else {
		RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
		RA_DrawPage();
		$('#RA_formError_quizprompt').show('','');
		$('#RA_formError_quizprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
		RA_DrawPage();
		RAif_Resize();
	}
}



//  ********************************************************************************


function RA_QuizClassPrompt1Yes () {
	switch (UserClassesCt) {
	case 0 :
		$('#RA_quizclassprompt_1').hide('','');
		$('#RA_quizclassprompt_2').show('','');
		$('#RA_quizclassprompt_3').hide('','');
		$('#RA_quizclassprompt_4').hide('','');
		RAif_Resize();
//window.self.focus();
		break;
	case 1 :
		$('#RA_quizclassprompt_1').hide('','');
		$('#RA_quizclassprompt_2').hide('','');
		$('#RA_quizclassprompt_3').hide('','');
		$('#RA_quizclassprompt_4').show('','');
		RAif_Resize();
//window.self.focus();
		break;
	default :
		$('#RA_quizclassprompt_1').hide('','');
		$('#RA_quizclassprompt_2').hide('','');
		$('#RA_quizclassprompt_3').show('','');
		$('#RA_quizclassprompt_4').hide('','');
		RAif_Resize();
//window.self.focus();
	}
}
function RA_QuizClassPrompt1No () {
	RA_CtrlWin.RA.CurrentUser.ClassUsing = null;
	$('#RA_quizclassprompt_1').hide('','');
	$('#RA_quizclassprompt_2').hide('','');
	$('#RA_quizclassprompt_3').hide('','');
	$('#RA_quizclassprompt_4').hide('','');
	$('#RA_quizclassprompt_5').show('','');
	setTimeout('RA_QuizClassPromptedYes()', 5);
	RAif_Resize();
//window.self.focus();
}

function RA_QuizClassPrompt2Yes () {
	$('#RA_quizclassprompt_2').show('','');
	$('#RA_quizclassprompt_4').hide('','');
	RAif_Resize();
//window.self.focus();
}
function RA_QuizClassPrompt2No () {
	$('#RA_quizclassprompt_2').show('','');
	$('#RA_quizclassprompt_4').hide('','');
	RAif_Resize();
//window.self.focus();
}

function RA_QuizClassPrompt3Yes (UseClass) {
	if (UseClass!=null) {
		RA_CtrlWin.RA.CurrentUser.ClassUsing = RA_CtrlWin.RA.CurrentUser.ClassLogins[UseClass].Class;
	} else {
		RA_CtrlWin.RA.CurrentUser.ClassUsing = null;
	}
	RA_DrawPage();
	$('#RA_quizclassprompt_1').hide('','');
	$('#RA_quizclassprompt_2').hide('','');
	$('#RA_quizclassprompt_3').hide('','');
	$('#RA_quizclassprompt_4').hide('','');
	$('#RA_quizclassprompt_5').show('','');
	setTimeout('RA_QuizClassPromptedYes()', 5);
	RAif_Resize();
//window.self.focus();
}
function RA_QuizClassPrompt3No () {
	RA_DrawPage();
	$('#RA_quizclassprompt_1').hide('','');
	$('#RA_quizclassprompt_2').show('','');
	$('#RA_quizclassprompt_3').hide('','');
	$('#RA_quizclassprompt_4').hide('','');
	RAif_Resize();
//window.self.focus();
}

function RA_QuizClassPromptedYes () {
	RA_CtrlWin.RA.CurrentUser.ClassPrompt = 0;
	RA_CtrlWin.RA.RAif.updated = true;
	RA_FormContinue();
}
function RA_QuizClassPromptedNo () {
	RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('quizclassprompt');
	RA_DrawPage();
	var x = document.getElementsByName('RA_QuizClassPrompt1')
	for (var i=0;i<x.length;i++) if (x[i].value=='Yes') x[i].checked = '';
	switch (UserClassesCt) {
	case 0 :
		$('#RA_quizclassprompt_1').show('','');
		$('#RA_quizclassprompt_2').hide('','');
		$('#RA_quizclassprompt_3').hide('','');
		$('#RA_quizclassprompt_4').hide('','');
		RAif_Resize();
//window.self.focus();
		break;
	case 1 :
		$('#RA_quizclassprompt_1').hide('','');
		$('#RA_quizclassprompt_2').hide('','');
		$('#RA_quizclassprompt_3').show('','');
		$('#RA_quizclassprompt_4').hide('','');
		RAif_Resize();
//window.self.focus();
		break;
	default :
		$('#RA_quizclassprompt_1').hide('','');
		$('#RA_quizclassprompt_2').hide('','');
		$('#RA_quizclassprompt_3').show('','');
		$('#RA_quizclassprompt_4').hide('','');
		RAif_Resize();
//window.self.focus();
	}
}


//  ********************************************************************************

function RA_goQuizJoinClass () {
	RA_CtrlWin.RA.RAif.vars['sClassCode'] = RAWS_cleanInput($('#RA_sClassCode')[0].value);
	RA_QuizJoinClass();
}
function RA_QuizJoinClass () {
	RA_CtrlWin.RA.RAif.state.push('quizjoiningclass');
	RA_DrawPage();
/*
setTimeout('RA_QuizJoinClass_0_go()', 5);
return;
*/
	RA_CtrlWin.RA.RAWS.Send( RA_QuizJoinClass_0_go, RAWS3_JoinClass, new Array( 'iUserID='+RA_CtrlWin.RA.CurrentUser.ID, 'sClassCode='+RA_CtrlWin.RA.RAif.vars['sClassCode'] ) );
}
function RA_QuizJoinClass_0_go () {
	RA_QuizJoinClass_0();
}
function RA_QuizJoinClass_0 () {
	RA_CtrlWin.RA.RAif.state.pop();
//prompt('',RA_CtrlWin.RAWS_error);
	if ( RA_CtrlWin.RAWS_error=='' ) {
		RA_CtrlWin.RA.CurrentUser.ClassPrompt = 0;
		RA_CtrlWin.RA.RAif.vars['UsingClassID'] = RA_CtrlWin.RAWS_iClassID
		RAif_RAXS_ReInit('quizjoinedclass');
	} else {
		if ( RA_CtrlWin.RAWS_error == 'SOME ERROR TO CATCH.') {
			RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
			RA_DrawPage();
			$('#RA_quizclassprompt_1').hide('','');
			$('#RA_quizclassprompt_2').show('','');
			$('#RA_quizclassprompt_3').hide('','');
			$('#RA_quizclassprompt_4').hide('','');
			$('#RA_formError_quizclassprompt').show('','');
			$('#RA_formError_quizclassprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
			RAif_Resize();
//window.self.focus();
		} else {
			RA_CtrlWin.RA.RAif.vars['Error'] = RA_CtrlWin.RAWS_error;
			RA_DrawPage();
			$('#RA_quizclassprompt_1').hide('','');
			$('#RA_quizclassprompt_2').show('','');
			$('#RA_quizclassprompt_3').hide('','');
			$('#RA_quizclassprompt_4').hide('','');
			$('#RA_formError_quizclassprompt').show('','');
			$('#RA_formError_quizclassprompt').html(RA_CtrlWin.RA.RAif.vars['Error']);
			RAif_Resize();
//window.self.focus();
		}
	}
}

//  ********************************************************************************

function RA_FormContinue () {
	RA_CtrlWin.RA.RAif.state.pop();
	if (RA_CtrlWin.RA.RAif.state.current() == '') {
		RA_FormCancel();
	} else {
		window.location.reload();
	}
}

function RA_FormCartContinue () {
	for (var item in RA_CtrlWin.RA.Cart.Items) {if (RA_CtrlWin.RA.Cart.Items.hasOwnProperty(item)) {
		if (RA_CtrlWin.RA.Cart.Items[item].InCart) {
			var x = RA_CtrlWin.RA.Cart.RemoveItem(RA_CtrlWin.RA.Cart.Items[item].Product.ID, RA_CtrlWin.RA.Cart.Items[item].ItemID);
		}
	}}
	RA_FormContinue();
}

function RA_FormAssignedCodesContinue () {
	delete RA_CtrlWin.RA.RAif.vars['UnlockProducts'];
	delete RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes'];
	delete RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'];
	RA_FormContinue();
}

//  ********************************************************************************

function RA_FormCancel () {
	delete RA_CtrlWin.RA.RAif.vars['UnlockProducts'];
	delete RA_CtrlWin.RA.RAif.vars['UnlockProductsCodes'];
	delete RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'];
	delete RA_CtrlWin.RA.RAif.vars['Code'];
	delete RA_CtrlWin.RA.RAif.vars['Email'];
	delete RA_CtrlWin.RA.RAif.vars['Password'];
	delete RA_CtrlWin.RA.RAif.vars['Error'];
	delete RA_CtrlWin.RA.RAif.vars['RegAlreadyAsked'];
//alert( RA_CtrlWin.RA.RAif.updated +' --- '+ RA_CtrlWin.RA.CurrentUser.ClassPrompt );
	RA_CtrlWin.RA.RAif.close();
}

//  ********************************************************************************

function RA_DrawPage () {
//alert('RA_DrawPage');
	var str = '';
	str = '';
	switch (RA_CtrlWin.RA.RAif.state.current()) {
	//  ********************************************************************************
		case 'login' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">log out</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			} else {
				switch (RA_CtrlWin.RA.RAif.state.next()) {
					case 'quizprompt' :
						str += '<p class="RA_formTitle">Quiz log in</p>';
						str += '<p class="RA_formText">You need to be logged in to take this quiz.</p>';
						break;
					case 'quizclassprompt' :
						str += '<p class="RA_formTitle">Quiz log in</p>';
						str += '<p class="RA_formText">You need to be logged in to take this quiz.</p>';
						break;
					default :
						str += '<p class="RA_formTitle">Log in</p>';
				}
				str += '<p id="RA_formError_login" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<form name="RA_Login" action="JavaScript:RA_goLogin();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formLabel"><nobr>E-mail address:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_Email" name="email" value="';
				if (RA_CtrlWin.RA.RAif.vars['Email']) {
				str += RA_CtrlWin.RA.RAif.vars['Email'];
				} else {
				str += '';
				}
				str += '"/></td>';
				str += '<td>&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td width="10" class="RA_formLabel"><nobr>Password:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formField"><input type="password" maxlength="16" id="RA_Password" name="pw" value="" style="width:90px;"/></td>';
				str += '<td>&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td></td><td>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("LOG IN", "JavaScript:RA_goLogin();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '</tr></table>';
				str += '</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
				str += '<p class="RA_formText">';
				str += 'If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
				str += '</p>';
			}
		break;
		case 'loggingin' :
			str += '<p class="RA_formText">logging in...</p>';
		break;
		case 'loggedin' :
//			str += '<p class="RA_formTitle">Log in</p>';
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">logging in...</p>';
				setTimeout('RA_FormContinue()', 5);
/*
				str += '<p class="RA_formText">';
				str += 'You are now logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_FormContinue();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '</tr></table>';
*/
			} else {
				str += '<p class="RA_formText">';
				str += 'You are not logged in.  <a href="JavaScript:RA_ShowLogin(\'login\',true);">Log in here</a>, or <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			}
		break;
	//  ********************************************************************************
		case 'logout' :
//			str += '<p class="RA_formTitle">Log out</p>';
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += 'Are you sure you want to log out?';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">log out</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			} else {
				str += '<p class="RA_formText">';
				str += 'You are not logged in.  <a href="JavaScript:RA_ShowLogin(\'login\',true);">Log in here</a>, or <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			}
		break;
		case 'loggingout' :
			str += '<p class="RA_formText">logging out...</p>';
		break;
		case 'loggedout' :
//			str += '<p class="RA_formText">logging out...</p>';
			setTimeout('RA_FormContinue()', 5);
/*
			str += '<p class="RA_formText">You are now logged out</p>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_FormContinue();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '</tr></table>';
*/
		break;
	//  ********************************************************************************
		case 'checkedemailbad' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">log out</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			} else {
				str += '<p class="RA_formTitle">Log in</p>';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formText"><nobr>You entered:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formValueDisplay">';
				if (RA_CtrlWin.RA.RAif.vars['Email']) {
				str += RA_CtrlWin.RA.RAif.vars['Email'];
				} else {
				str += '';
				}
				str += '</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<p class="RA_formText">We don\'t have an account with this e-mail address. Would you like to create a new account?</p>';
				str += '<p class="RA_formText">';
				str += '<input type="radio" onclick="RA_LoginYesReg()"/>Yes&nbsp;&nbsp;&nbsp;<input type="radio" onclick="RA_LoginNoCheck()"/>No, try a different e-mail address.';
				str += '</p>';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
			}
		break;
	//  ********************************************************************************
		case 'checkemail' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">log out</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			} else {
				switch (RA_CtrlWin.RA.RAif.state.next()) {
					case 'docheckout' :
						str += '<p class="RA_formTitle">Check out: Step 1 of 2: Register</p>';
						break;
					case 'doassignusercodes' :
						str += '<p class="RA_formTitle">Step 2 of 2: Log in or Register</p>';
						break;
					case 'quizprompt' :
						str += '<p class="RA_formTitle">Quiz log in</p>';
						break;
					case 'quizclassprompt' :
						str += '<p class="RA_formTitle">Quiz log in</p>';
						break;
					default :
//						str += '<p class="RA_formTitle">Registration</p>';
				}

/*VERSION 2, LOGIN/CHECKEMAIL
			str += '<table class="RA_box_tbl" width="100%" border="0" cellpadding="0" cellspacing="0">';
			str += '<tr>';
			str += '<td class="RA_box_tbl_tl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_ml">&nbsp;</td>';
			str += '<td class="RA_box_tbl_mc">';

			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="50%" valign="top" style="padding:0px 10px 10px 30px">';
				str += '<p class="RA_formTitle">Returning Student?</p>';
				str += '<p id="RA_formError_checkemaillogin" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<p class="RA_formText" id="RA_Email_error"><nobr>Enter your e-mail address and password to log in.&nbsp;</nobr></p>';
				str += '<form name="RA_CheckEmailANDLogin" action="JavaScript:RA_goCheckEmailANDLogin();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formLabelSmall">';
				str += 'E-mail address';
				str += '</td>';
				str += '<td width="10" class="RA_formLabelSmall">';
				str += 'Password';
				str += '</td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td width="10" class="RA_formField">';
				str += '<input maxlength="150" type="email" id="RA_EmailLOGIN" name="emaillogin" value="" style="width:130px;"/></td>';
				str += '<td width="10" class="RA_formField">';
				str += '<input type="password" maxlength="16" id="RA_Password" name="password" value="" style="width:90px;"/></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckEmailANDLogin();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += 'If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
				str += '</p>';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';

			str += '</td>';
			str += '<td width="50%" valign="top" style="padding:0px 10px 10px 30px; border-left:1px solid #000;">';
				str += '<p class="RA_formTitle">New Student?</p>';
				str += '<p id="RA_formError_checkemail" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<p class="RA_formText" id="RA_Email_error"><nobr>Enter the e-mail address you would like to register:&nbsp;</nobr></p>';
				str += '<form name="RA_CheckEmail" action="JavaScript:RA_goCheckEmail();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_Email" name="email" value="';
//				if (RA_CtrlWin.RA.RAif.vars['Email']) {
//				str += RA_CtrlWin.RA.RAif.vars['Email'];
//				} else {
//				}
				str += '"/></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckEmail();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
				str += '<br/>';
			str += '</td>';
			str += '</tr></table>';

			str += '</td>';
			str += '<td class="RA_box_tbl_mr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_bl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_bc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_br">&nbsp;</td>';
			str += '</tr>';
			str += '</table>';
*/

/*VERSION 1, BASIC EMAIL CHECK ONLY
*/
				str += '<p id="RA_formError_checkemail" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<form name="RA_CheckEmail" action="JavaScript:RA_goCheckEmail();">';
				if (RA_CtrlWin.RA.RAif.vars['RegAlreadyAsked']) {
					str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
					str += '<td width="10" class="RA_formText" id="RA_Email_error"><nobr>Enter the e-mail address you would like to register:&nbsp;</nobr></td>';
				} else {
					str += '<p class="RA_formText">Do you already have an account with us? If you have ever used a textbook or online resources published by Bedford/St. Martin&#x0027;s, W.H. Freeman, or Worth Publishers, you may already have an account with us.</p>';
					str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
					str += '<td width="10" class="RA_formText" id="RA_Email_error"><nobr>Enter your e-mail address and we\'ll check for you:&nbsp;</nobr></td>';
				}
				str += '<td width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_Email" name="email" value="';
//				if (RA_CtrlWin.RA.RAif.vars['Email']) {
//				str += RA_CtrlWin.RA.RAif.vars['Email'];
//				} else {
//				}
				str += '"/></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckEmail();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
				str += '<br/>';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
			}
		break;
		case 'checkingemail' :
			str += '<p class="RA_formText">checking...</p>';
		break;
		case 'checkedemail' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">log out</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			} else {

				switch (RA_CtrlWin.RA.RAif.state.next()) {
					case 'docheckout' :
						str += '<p class="RA_formTitle">Check out: Step 1 of 2: Register</p>';
						break;
					case 'doassignusercodes' :
						str += '<p class="RA_formTitle">Step 2 of 2: Log in Register</p>';
						break;
					case 'quizprompt' :
						str += '<p class="RA_formTitle">Quiz log in</p>';
						break;
					case 'quizclassprompt' :
						str += '<p class="RA_formTitle">Quiz log in</p>';
						break;
					default :
//						str += '<p class="RA_formTitle">Registration</p>';
				}

				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formText"><nobr>You entered:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formValueDisplay">';
				if (RA_CtrlWin.RA.RAif.vars['Email']) {
				str += RA_CtrlWin.RA.RAif.vars['Email'];
				} else {
				str += '';
				}
				str += '</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';

				str += '<p class="RA_formText">';
				str += 'We have an account with this e-mail address. ';
					switch (RA_CtrlWin.RA.RAif.state.next()) {
						case 'docheckout' :
				str += 'Would you like to use this account to purchase your premium content?';
							break;
						case 'doassignusercodes' :
				str += 'Would you like to use this account to unlock your premium content?';
							break;
						case 'quiz' :
				str += 'Would you like to use this account to access your quiz content?';
							break;
						default :
				str += 'Would you like to log in with this account?';
					}
				str += '</p>';

			str += '<table class="RA_box_tbl" width="100%" border="0" cellpadding="0" cellspacing="0">';
			str += '<tr>';
			str += '<td class="RA_box_tbl_tl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_ml">&nbsp;</td>';
			str += '<td class="RA_box_tbl_mc">';

			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="50%" valign="top" style="padding:0px 10px 10px 30px">';
				str += '<p class="RA_formTitle">Yes, log in</p>';
				str += '<p id="RA_formError_checkemaillogin" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<form name="RA_CheckEmailLogin" action="JavaScript:RA_goCheckEmailLogin();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formText"><nobr>Enter your password:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formField"><input type="password" maxlength="16" id="RA_Password" name="password" value="" style="width:90px;"/></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckEmailLogin();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += 'If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
				str += '</p>';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';

			str += '</td>';
			str += '<td width="50%" valign="top" style="padding:0px 10px 10px 30px; border-left:1px solid #000;">';
				str += '<p class="RA_formTitle">No, create a new account</p>';
				str += '<p id="RA_formError_checkemail" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<p class="RA_formText" id="RA_Email_error"><nobr>Enter the e-mail address you would like to register:&nbsp;</nobr></p>';
				str += '<form name="RA_CheckEmail" action="JavaScript:RA_goCheckEmail();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_Email" name="email" value="';
//				if (RA_CtrlWin.RA.RAif.vars['Email']) {
//				str += RA_CtrlWin.RA.RAif.vars['Email'];
//				} else {
//				}
				str += '"/></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckEmail();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
				str += '<br/>';
			str += '</td>';
			str += '</tr></table>';

			str += '</td>';
			str += '<td class="RA_box_tbl_mr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_bl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_bc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_br">&nbsp;</td>';
			str += '</tr>';
			str += '</table>';


			}
		break;
		case 'checkemaillogin' :
			switch (RA_CtrlWin.RA.RAif.state.next()) {
				case 'docheckout' :
					str += '<p class="RA_formTitle">Check out: Step 1 of 2: Register</p>';
					break;
				case 'doassignusercodes' :
					str += '<p class="RA_formTitle">Step 2 of 2: Log in Register</p>';
					break;
				case 'quiz' :
					str += '<p class="RA_formTitle">Registration</p>';
					break;
				default :
//					str += '<p class="RA_formTitle">Registration</p>';
			}
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">log out</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			} else {

				switch (RA_CtrlWin.RA.RAif.state.next()) {
					case 'docheckout' :
						str += '<p class="RA_formTitle">Check out: Step 1 of 2: Register</p>';
						break;
					case 'doassignusercodes' :
						str += '<p class="RA_formTitle">Step 2 of 2: Log in or Register</p>';
						break;
					case 'quizprompt' :
						str += '<p class="RA_formTitle">Quiz log in</p>';
						break;
					case 'quizclassprompt' :
						str += '<p class="RA_formTitle">Quiz log in</p>';
						break;
					default :
//						str += '<p class="RA_formTitle">Registration</p>';
				}

				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formText"><nobr>You entered:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formValueDisplay">';
				if (RA_CtrlWin.RA.RAif.vars['Email']) {
				str += RA_CtrlWin.RA.RAif.vars['Email'];
				} else {
				str += '';
				}
				str += '</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';

				str += '<p class="RA_formText">';
				str += 'We have an account with this e-mail address. ';
					switch (RA_CtrlWin.RA.RAif.state.next()) {
						case 'docheckout' :
				str += 'Would you like to use this account to purchase your premium content?';
							break;
						case 'doassignusercodes' :
				str += 'Would you like to use this account to unlock your premium content?';
							break;
						case 'quiz' :
				str += 'Would you like to use this account to access your quiz content?';
							break;
						default :
				str += 'Would you like to log in with this account?';
					}
				str += '</p>';

			str += '<table class="RA_box_tbl" width="100%" border="0" cellpadding="0" cellspacing="0">';
			str += '<tr>';
			str += '<td class="RA_box_tbl_tl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_ml">&nbsp;</td>';
			str += '<td class="RA_box_tbl_mc">';

			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="50%" valign="top" style="padding:0px 10px 10px 30px">';
				str += '<p class="RA_formTitle">Yes, log in</p>';
				str += '<p id="RA_formError_checkemaillogin" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<form name="RA_CheckEmailLogin" action="JavaScript:RA_goCheckEmailLogin();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formText"><nobr>Enter your password:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formField"><input type="password" maxlength="16" id="RA_Password" name="password" value="" style="width:90px;"/></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckEmailLogin();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
				str += '<p class="RA_formText">';
				str += 'If you have forgotten your password, <a href="JavaScript:RA_doEmailPassword();">click here</a> and we\'ll e-mail it to you.';
				str += '</p>';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';

			str += '</td>';
			str += '<td width="50%" valign="top" style="padding:0px 10px 10px 30px; border-left:1px solid #000;">';
				str += '<p class="RA_formTitle">No, create a new account</p>';
				str += '<p id="RA_formError_checkemail" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<form name="RA_CheckEmail" action="JavaScript:RA_goCheckEmail();">';
				if (RA_CtrlWin.RA.RAif.vars['RegAlreadyAsked']) {
					str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
					str += '<td width="10" class="RA_formText" id="RA_Email_error"><nobr>Enter the e-mail address you would like to register:&nbsp;</nobr></td>';
				} else {
					str += '<p class="RA_formText">Do you already have an account with us? If you have ever used a textbook or online resources published by Bedford/St. Martin&#x0027;s, W.H. Freeman, or Worth Publishers, you may already have an account with us.</p>';
					str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
					str += '<td width="10" class="RA_formText" id="RA_Email_error"><nobr>Enter your e-mail address and we\'ll check for you:&nbsp;</nobr></td>';
				}
				str += '<td width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_Email" name="email" value="';
//				if (RA_CtrlWin.RA.RAif.vars['Email']) {
//				str += RA_CtrlWin.RA.RAif.vars['Email'];
//				} else {
//				}
				str += '"/></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckEmail();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';

			str += '</td>';
			str += '</tr></table>';
			str += '<br/>';

			str += '</td>';
			str += '<td class="RA_box_tbl_mr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_bl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_bc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_br">&nbsp;</td>';
			str += '</tr>';
			str += '</table>';

			}
		break;
		case 'checkemailloggingin' :
			str += '<p class="RA_formText">logging in...</p>';
		break;
		case 'checkemailloggedin' :
//			str += '<p class="RA_formTitle">Log in</p>';
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">logging in...</p>';
				setTimeout('RA_FormContinue()', 5);
/*
				str += '<p class="RA_formText">';
				str += 'You are now logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">';
				var fnstr = 'JavaScript:RA_FormContinue()';
				str += ButtonHTML("CONTINUE", fnstr, "", "primary", false, "medium", "style='float:none; text-align:center'");
				str += '</td>';
				str += '</tr></table>';
*/
			} else {
				str += '<p class="RA_formText">';
				str += 'You are not logged in.  <a href="JavaScript:RA_ShowLogin(\'login\',true);">Log in here</a>, or <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			}
		break;
	//  ********************************************************************************
		case 'emailpassword' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">log out</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			} else {
//				str += '<p class="RA_formTitle">E-mail Password</p>';
				str += '<p id="RA_formError_emailpassword" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<p class="RA_formText" id="RA_Email_error">Enter your e-mail address and we\'ll send your password to you.</p>';
				str += '<form name="RA_EmailPassword" action="JavaScript:RA_goEmailPassword();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_Email" name="email" value="';
				if (RA_CtrlWin.RA.RAif.vars['Email']) {
				str += RA_CtrlWin.RA.RAif.vars['Email'];
				} else {
				str += 'e-mail address';
				}
				str += '" onfocus="if (this.value==\'e-mail address\') this.value=\'\'" onblur="if (this.value==\'\') this.value=\'e-mail address\';"/></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goEmailPassword();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
				str += '<br/>';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
			}
		break;
		case 'emailingpassword' :
			str += '<p class="RA_formText">emailing...</p>';
		break;
		case 'emailedpassword' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">log out</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			} else {
				str += '<p class="RA_formText">';
				str += 'Your password has been e-mailed to ';
				str += '<span class="RA_formValueDisplay">';
				if (RA_CtrlWin.RA.RAif.vars['Email']) {
				str += RA_CtrlWin.RA.RAif.vars['Email'];
				} else {
				str += 'the address you entered';
				}
				str += '</span>';
				str += '</p>';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("LOG IN", "JavaScript:RA_ShowLogin(\'login\');", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';

			}
		break;
		case 'register' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">log out</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			} else {

				str += '<p class="RA_formTitle">';
				switch (RA_CtrlWin.RA.RAif.state.next()) {
					case 'docheckout' :
					str += 'Check out: Step 1 of 2: Register';
						break;
					case 'doassignusercodes' :
					str += 'Step 2 of 2: Register';
						break;
					case 'quizprompt' :
					str += 'Quiz log in';
						break;
					case 'quizclassprompt' :
					str += 'Quiz log in';
						break;
					default :
					str += 'Register';
				}
				str += '</p>';

				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formText"><nobr>You entered:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formValueDisplay">';
				if (RA_CtrlWin.RA.RAif.vars['Email']) {
				str += RA_CtrlWin.RA.RAif.vars['Email'];
				} else {
				str += '';
				}
				str += '</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';

				str += '<p class="RA_formText">';
				str += 'We don\'t have an account with this e-mail address. Would you like to create one?';
				str += '</p>';

			str += '<table class="RA_box_tbl" width="100%" border="0" cellpadding="0" cellspacing="0">';
			str += '<tr>';
			str += '<td class="RA_box_tbl_tl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_ml">&nbsp;</td>';
			str += '<td class="RA_box_tbl_mc">';

			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="50%" valign="top" style="padding:0px 10px 10px 0px">';
				str += '<p class="RA_formTitle">Yes, create an account with this e-mail address</p>';
				str += '<p class="RA_formText">';
				str += 'You can register an account with this e-mail address by completing the form below.';
				str += '</p>';
				str += '<p id="RA_formError_register" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<form name="RA_Register" action="JavaScript:RA_goRegister();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formLabel"><nobr>Enter your first name:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formField"><input maxlength="50" type="text" id="RA_FName" name="email" value="';
				if (RA_CtrlWin.RA.RAif.vars['FName']) {
				str += RA_CtrlWin.RA.RAif.vars['FName'];
				} else {
				str += '';
				}
				str += '"/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_FName_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td>&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td width="10" class="RA_formLabel"><nobr>Enter your last name:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formField"><input maxlength="50" type="text" id="RA_LName" name="email" value="';
				if (RA_CtrlWin.RA.RAif.vars['LName']) {
				str += RA_CtrlWin.RA.RAif.vars['LName'];
				} else {
				str += '';
				}
				str += '"/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_LName_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td>&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td width="10" class="RA_formLabel"><nobr>Choose your password:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formField"><input type="password" maxlength="16" id="RA_Password" name="password" value="" style="width:90px;"/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_Password_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<br/>';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:1px solid #f00;"><tr>';
				str += '<td colspan="4" style="padding:4px;"><p class="RA_formText">Please confirm your e-mail address and password. You will need to remember these for the next time you log in.</p></td>';
				str += '</tr><tr>';
				str += '<td width="10" class="RA_formLabel"><nobr>Re-enter your e-mail address:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_Email_confirm" name="email_confirm" value=""/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_Email_confirm_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td>&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td width="10" class="RA_formLabel"><nobr>Re-enter your password:&nbsp;</nobr></td>';
				str += '<td width="10" class="RA_formField"><input type="password" maxlength="16" id="RA_Password_confirm" name="password_confirm" value="" style="width:90px;"/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_Password_confirm_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td>&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="10">&nbsp;</td>';
				str += '</tr></table>';
				str += '<br/>';

				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("REGISTER", "JavaScript:RA_goRegister()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';

			str += '</td>';
			str += '<td width="50%" valign="top" style="padding:0px 10px 10px 30px; border-left:1px solid #000;">';
				str += '<p class="RA_formTitle">No, use a different e-mail address</p>';
				str += '<p class="RA_formText">';
				str += 'If you are certain you have an account with us, please try again. Make sure you are entering your e-mail address correctly.';
				str += '</p>';
				str += '<p id="RA_formError_checkemail" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<form name="RA_CheckEmail" action="JavaScript:RA_goCheckEmail();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_Email" name="email" value="';
//				if (RA_CtrlWin.RA.RAif.vars['Email']) {
//				str += RA_CtrlWin.RA.RAif.vars['Email'];
//				} else {
//				}
				str += '"/></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckEmail();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
				str += '<br/>';
			str += '</td>';
			str += '</tr></table>';

			str += '</td>';
			str += '<td class="RA_box_tbl_mr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_bl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_bc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_br">&nbsp;</td>';
			str += '</tr>';
			str += '</table>';

			}
		break;
		case 'registering' :
			str += '<p class="RA_formText">registering...</p>';
		break;
		case 'registered' :
			str += '<p class="RA_formTitle">';
			switch (RA_CtrlWin.RA.RAif.state.next()) {
				case 'docheckout' :
				str += 'Check out: Step 1 of 2: Register';
					break;
				case 'doassignusercodes' :
				str += 'Step 2 of 2: Register';
					break;
				case 'quiz' :
				str += 'Register';
					break;
				default :
				str += 'Register';
			}
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are now registered and logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_FormContinue();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '</tr></table>';
			} else {
				str += '<p class="RA_formText">';
				str += 'You are not logged in.  <a href="JavaScript:RA_ShowLogin(\'checkemail\',true);">Log in here</a>, or <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			}
		break;
	//  ********************************************************************************
		case 'codeorcart' :
			str += '<p class="RA_formText">';
			str += 'Did you receive an access card packaged with your text?';
			str += '</p>';
			str += '<p class="RA_formText">';
			str += '<input type="radio" name="RA_CodeOrCardPrompt" value="Yes" onclick="RA_CodeOrCardPromptYes()"/>Yes&nbsp;&nbsp;&nbsp;';
			str += '<input type="radio" name="RA_CodeOrCardPrompt" value="No" onclick="RA_CodeOrCardPromptNo()"/>No.';
			str += '</p>';
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
		break;
	//  ********************************************************************************
		case 'checkcode' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formTitle">Unlock your resources</p>';
			} else {
				str += '<p class="RA_formTitle">Step 1 of 2: Enter Your Activation Code</p>';
			}
			str += '<div id="RA_formError_checkcode" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</div>';

			str += '<form name="RA_CheckCode" action="JavaScript:RA_goCheckCode();">';
			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td valign="top" width="10" class="RA_formLabel"><nobr>Enter the activation code printed on your access card:&nbsp;</nobr></td>';
			str += '<td valign="top" width="10" class="RA_formField"><nobr><input maxlength="50" type="text" id="RA_Code" name="code" ';
//			if (RA_CtrlWin.RA.RAif.vars['Code']) {
//			str += ' value="'+ RA_CtrlWin.RA.RAif.vars['Code'] +'" onfocus="if (this.value==\'\') this.value=\'r6-3aj-48c4dz6a\';"';
//			} else {
//			str += ' value="" onfocus="if (this.value==\'\') this.value=\'r6-3aj-48c4dz6a\';"';
//			}
			str += ' value=""';
			str += '/>&nbsp;&nbsp;</nobr></td>';
			str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckCode();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
			str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
		break;
		case 'checkingcode' :
			str += '<p class="RA_formText">checking code ...</p>';
		break;
		case 'checkedcode' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formTitle">Unlock your resources</p>';
			} else {
				str += '<p class="RA_formTitle">Step 1 of 2</p>';
			}
			str += '<p class="RA_formText">The code(s) you entered unlock';
//			if (RA_CtrlWin.RA.RAif.vars['CodesEntered'] > 1) {
//				str += 's you entered unlock';
//			} else {
//				str += ' you entered unlocks';
//			}
			str += ' the following premium content. Is this what you want to unlock? If so, click continue.</p>';

			for (var i in RA_CtrlWin.RA.RAif.vars['UnlockProducts']) {if (RA_CtrlWin.RA.RAif.vars['UnlockProducts'].hasOwnProperty(i)) {
				str += '<p class="RA_formText">'+ RA_CtrlWin.RA.Products[RA_CtrlWin.RA.RAif.vars['UnlockProducts'][i].ID].DisplayAll('form') +'</p>';
			}}
			str += '<div id="RA_formError_checkcode" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</div>';
			str += '<form name="RA_CheckCode" action="JavaScript:RA_goCheckCode();">';
			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td valign="top" width="10" class="RA_formText"><nobr>Do you have another activation code?&nbsp;</nobr></td>';
			str += '<td valign="top" width="10" class="RA_formText"><nobr><div id="RA_checkedcode_another_prompt"><a href="JavaScript:void(0);" onclick="document.getElementById(\'RA_checkedcode_another\').style.display=\'block\';document.getElementById(\'RA_checkedcode_another_prompt\').style.display=\'none\';">Click here to enter it.</a></div></nobr></td>';
			str += '<td width="10" class="RA_button"></td>';
			str += '<td>&nbsp;</td>';
			str += '</tr><tr id="RA_checkedcode_another" style="display:none">';
			str += '<td valign="top" width="10" class="RA_formText"><nobr>Enter additional activation code:&nbsp;</nobr></td>';
			str += '<td valign="top" width="10" class="RA_formField"><nobr><input maxlength="50" type="text" id="RA_Code" name="code" value="';
//			if (RA_CtrlWin.RA.RAif.vars['Code']) {
//			str += RA_CtrlWin.RA.RAif.vars['Code'];
//			} else {
//			str += 'f4-y6-48c4emyc';
//			}
			str += '"/>&nbsp;&nbsp;</nobr></td>';
			str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goCheckCode();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
			str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_CodeContinue()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
		break;
	//  ********************************************************************************
		case 'assignusercodes' :
			str += '<p class="RA_formTitle">Unlock your resources (assign)</p>';
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p id="RA_formError_assignusercodes" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_FormContinue()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
			} else {
				str += '<p class="RA_formText">';
				str += 'You are not logged in.  <a href="JavaScript:RA_ShowLogin(\'login\',true);">Log in here</a>, or <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			}
		break;
		case 'assigningusercodes' :
			str += '<p class="RA_formText">unlocking resources ...</p>';
		break;
		case 'assignedusercodes' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				if (RA_CtrlWin.RA.RAif.vars['justloggedin']) {
					str += '<p class="RA_formText">';
					str += 'You are now logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+'), ';
					str += 'and you have unlocked the following premium resource';
					if (RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'] > 1) {
						str += 's';
					} else {
						str += '';
					}
					str += '.</p>';
					delete RA_CtrlWin.RA.RAif.vars['justloggedin'];
				} else {
					str += '<p class="RA_formTitle">You have unlocked the following premium resource';
					if (RA_CtrlWin.RA.RAif.vars['UnlockProductsCt'] > 1) {
						str += 's';
					} else {
						str += '';
					}
					str += '.</p>';
				}
				for (var i in RA_CtrlWin.RA.RAif.vars['UnlockProducts']) {if (RA_CtrlWin.RA.RAif.vars['UnlockProducts'].hasOwnProperty(i)) {
					str += '<p class="RA_formText">'+ RA_CtrlWin.RA.Products[RA_CtrlWin.RA.RAif.vars['UnlockProducts'][i].ID].DisplayAll('form') +'</p>';
				}}
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_FormAssignedCodesContinue()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
			} else {
				str += '<p class="RA_formText">';
				str += 'You are not logged in.  <a href="JavaScript:RA_ShowLogin(\'login\',true);">Log in here</a>, or <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			}
		break;
	//  ********************************************************************************
		case 'cart' :

			if (RA_CtrlWin.RA.RAif.vars['justloggedin']) {
				str += '<p class="RA_formText">';
				str += 'You are now logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				delete RA_CtrlWin.RA.RAif.vars['justloggedin'];
			}
			str += '<p class="RA_formTitle">Shopping Cart</p>';

			str += '<div id="RA_formError_cart" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</div>';
			str += '<br/>';

			str += '<table class="RA_box_tbl" width="100%" border="0" cellpadding="0" cellspacing="0">';
			str += '<tr>';
			str += '<td class="RA_box_tbl_tl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_ml">&nbsp;</td>';
			str += '<td class="RA_box_tbl_mc">';

			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';

			str += '<td align="center" valign="top" width="100%" style="padding:0px 10px 30px 0px">';
				str += '<table width="660" border="0" cellpadding="0" cellspacing="0">';
				str += '<tr>';
				str += '<td width="25" style="width:25px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '<td style="width:150px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '<td width="5" style="width:5px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '<td width="140" style="width:140px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '<td width="10" style="width:10px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '<td width="10" style="width:10px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '<td width="140" style="width:140px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '<td width="5" style="width:5px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '<td width="25" style="width:25px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '<td style="width:150px;margin:0px;padding:0px;font-size:1px;">&nbsp;</td>';
				str += '</tr>';

				str += '<tr><td colspan="4" style="margin-top:0px;vertical-align:top;">';
				str += '<p class="RA_formTitle" style="margin-top:0px;">Available premium resources</p><hr style="background-color:#aaa;height:1px;"/>';
				str += '</td>';
//				str += '<td rowspan="10" width="10" style="border-right:1px solid #000;">&nbsp;</td>';
//				str += '<td rowspan="10" width="10">&nbsp;</td>';
				str += '<td width="10" style="border-right:1px solid #000;">&nbsp;</td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td colspan="4" style="margin-top:0px;vertical-align:top;">';
				str += '<p class="RA_formTitle" style="margin-top:0px;">Your cart</p><hr style="background-color:#aaa;height:1px;"/>';
				str += '</td></tr>';
			var displayedItems = new Object();
			for (var iitem in RA_CtrlWin.RA.Cart.Items) {if (RA_CtrlWin.RA.Cart.Items.hasOwnProperty(iitem)) {
				var item = RA_CtrlWin.RA.Cart.Items[iitem];
				if (!displayedItems[item.Product.ID]) {

				str += '<tr>';
				str += '<td width="25" valign="top" align="center" class="RA_formText"><nobr>';
					if ( item.Product.CurrentUserAccess() >= item.LevelOfAccess ) {
				str += '<img src="images/RA_premium_unlocked.gif" width="18" height="13" border="0" alt="unlocked"/>&nbsp;&nbsp;';
					} else {
				str += '<img src="images/RA_premium_locked.gif" width="18" height="13" border="0" alt="locked"/>&nbsp;&nbsp;';
					}
				str += '&nbsp;&nbsp;</nobr></td>';
				str += '<td valign="top" class="RA_formText"><div style="margin:0px;padding:0px;">';
				str += item.Product.Title;
				str += '&nbsp;&nbsp;<br/>';
				str += '</div></td>';
				str += '<td width="5"><br/><br/></td>';
				str += '<td width="140" class="RA_formLabel" align="right" valign="top" style="width:140px">';

				if ( item.Product.CurrentUserAccess() >= item.LevelOfAccess ) {
				str += '<p style="margin-top:0;margin-bottom:10px"><nobr><span style="color:#c00">you have access</span></nobr></p>';
				} else {
			for (var jitem in RA_CtrlWin.RA.Cart.Items) {if (RA_CtrlWin.RA.Cart.Items.hasOwnProperty(jitem)) {
				var item2 = RA_CtrlWin.RA.Cart.Items[jitem];
				if (item.Product.ID == item2.Product.ID) {
				str += '<p style="margin-top:0;margin-bottom:5px;">';
				str += '<nobr><i>'
					if (item2.ExpType == 'Relative') {
						var tmpExp = item2.ExpValue;
						if (tmpExp%365==0) {
				str += ''+ tmpExp/365 +' year access';
						} else {
				str += ''+ tmpExp +' day access';
						}
					} else if (item2.ExpType == 'Absolute') {
				str += 'access until '+ item2.ExpValue +'';
					}
				str += '&nbsp;&nbsp;</i></nobr>';
				str += '$'+ item2.Price +'</p>';
					if ( item2.InCart ) {
				str += '<p style="margin-bottom:10px"><nobr>in cart &gt;</nobr></p>';
					} else {
				str += '<table border="0" cellpadding="0" cellspacing="0" style="margin-bottom:10px"><tr>';
				str += '<td>&nbsp;</td>';
				str += '<td width="98" class="RA_button">'+ ButtonHTML('ADD TO CART &gt;', 'JavaScript:RA_AddToCart(\''+ item2.Product.ID +'\',\''+ item2.ItemID +'\')', '', 'primary', false, 'medium', 'style="float:none; text-align:center"') +'</td>';
				str += '</tr></table>';
					}
				}
			}}
				}
				str += '</td>';
				str += '<td width="10" style="border-right:1px solid #000;">&nbsp;</td>';
				str += '<td width="10">&nbsp;</td>';
					//-----------------------------------------------------
//					if (item.InCart) {
			var item2InCart = false;
			for (var jitem in RA_CtrlWin.RA.Cart.Items) {if (RA_CtrlWin.RA.Cart.Items.hasOwnProperty(jitem)) {
				var item2 = RA_CtrlWin.RA.Cart.Items[jitem];
				if (item.Product.ID == item2.Product.ID && item2.InCart) {
					item2InCart = true;
				}
			}}
					if (item2InCart) {
				str += '<td width="140" class="RA_formLabel" align="left" valign="top" style="width:140px;">';
			for (var jitem in RA_CtrlWin.RA.Cart.Items) {if (RA_CtrlWin.RA.Cart.Items.hasOwnProperty(jitem)) {
				var item2 = RA_CtrlWin.RA.Cart.Items[jitem];
					if (item2.InCart) {
				if (item.Product.ID == item2.Product.ID) {
				str += '<p style="width:135px;margin-top:0;margin-bottom:5px;">';
				str += '<nobr><i>'
					if (item2.ExpType == 'Relative') {
						var tmpExp = item2.ExpValue;
						if (tmpExp%365==0) {
				str += ''+ tmpExp/365 +' year access';
						} else {
				str += ''+ tmpExp +' day access';
						}
					} else if (item2.ExpType == 'Absolute') {
				str += 'access until '+ item2.ExpValue +'';
					}
				str += '&nbsp;&nbsp;</i></nobr>';
				str += '$'+ item2.Price +'</p>';
				str += '<table border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="68" class="RA_button">'+ ButtonHTML('&lt; REMOVE', 'JavaScript:RA_RemoveFromCart(\''+ item2.Product.ID +'\',\''+ item2.ItemID +'\')', '', 'primary', false, 'medium', 'style="float:none; text-align:center"') +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
				}
					}
			}}
				str += '</td>';
				str += '<td width="5"><br/><br/></td>';
				str += '<td width="25" valign="top" align="center" class="RA_formText"><nobr>';
				str += '<img src="images/RA_premium_locked.gif" width="18" height="13" border="0" alt="locked"/>&nbsp;&nbsp;';
				str += '&nbsp;&nbsp;</nobr></td>';
				str += '<td valign="top" class="RA_formText"><div style="margin:0px;padding:0px;">';
				str += item.Product.Title;
				str += '&nbsp;&nbsp;<br/>';
				str += '</div></td>';
					} else {
				str += '<td width="140" style="width:140px">&nbsp;</td>';
				str += '<td width="5"><br/><br/></td>';
				str += '<td width="25">&nbsp;</td>';
				str += '<td>&nbsp;</td>';
					}
				str += '</tr>';
				displayedItems[item.Product.ID] = true;
				}//displayedItems[item.Product.ID]
			}}
				str += '<tr>';
				str += '<td>&nbsp;</td>';
				str += '<td>&nbsp;</td>';
				str += '<td>&nbsp;</td>';
				str += '<td>&nbsp;</td>';
				str += '<td width="10" style="border-right:1px solid #000;">&nbsp;</td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td colspan="4" style="padding:20px 10px 10px 10px;">';
					str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
					str += '<td width="110" class="RA_button">'+ ButtonHTML('CHECK OUT NOW', 'JavaScript:RA_GoCartCheckOut()', '', 'primary', false, 'medium', 'style="float:none; text-align:center"') +'</td>';
					str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
					str += '<td>&nbsp;</td>';
					str += '</tr></table>';
				str += '</td>';
				str += '</tr>';
				str += '</table>';
			str += '</td>';
			str += '</tr></table>';

			str += '</td>';
			str += '<td class="RA_box_tbl_mr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_bl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_bc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_br">&nbsp;</td>';
			str += '</tr>';
			str += '</table>';

			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
		break;
		case 'checkoutschoolprompt' :
			if (!RA_CtrlWin.RA.RAif.vars['Schools']) {
				RA_CtrlWin.RA.RAif.vars['Schools'] = new Array();
			}
			if (!RA_CtrlWin.RA.RAif.vars['SchoolType']) {
				RA_CtrlWin.RA.RAif.vars['SchoolType'] = 'C';
			}
			if (!RA_CtrlWin.RA.RAif.vars['iZip']) {
				RA_CtrlWin.RA.RAif.vars['iZip'] = NaN;
			}
			if (RA_CtrlWin.RA.RAif.vars['justloggedin']) {
				str += '<p class="RA_formText">';
				str += 'You are now logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				delete RA_CtrlWin.RA.RAif.vars['justloggedin'];
			}
			str += '<p class="RA_formTitle">Checking out...</p>';
			str += '<p id="RA_formError_checkoutschoolprompt" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';
			str += '<p class="RA_formText">Is the course for which you are using this resource being offered by a...<br/>';
			str += '<input type="radio" name="RA_SchoolType" value="C"';
			if (RA_CtrlWin.RA.RAif.vars['SchoolType'] == 'C') {
				str += ' CHECKED';
			}
			str += '/>college or university&nbsp;&nbsp;&nbsp;or&nbsp;';
			str += '<input type="radio" name="RA_SchoolType" value="H"';
			if (RA_CtrlWin.RA.RAif.vars['SchoolType'] == 'H') {
				str += ' CHECKED';
			}
			str += '/>high school?.';
			str += '</p>';
			str += '<form name="RA_CheckOutLookupSchool" action="JavaScript:RA_goCheckOutLookupSchool();">';
			str += '<p class="RA_formText">Please enter the zip code or postal code <br/>of your college, university, or high school: ';
			str += '<input maxlength="10" type="text" id="RA_iZip" name="zip" value="';
			if (! isNaN(RA_CtrlWin.RA.RAif.vars['iZip']) ) {
				str += RA_CtrlWin.RA.RAif.vars['iZip'];
			}
			str += '" size="10" maxlength="10"/>';
			str += '<br/><span class="RA_formText" style="font-size:8pt;">';
			str += '(If you do not know the zip code or postal code of your school, enter your home zip code or postal code.)'
			str += '</span></p>';
			if (RA_CtrlWin.RA.RAif.vars['Schools'].length > 0) {
			str += '<p class="RA_formText" style="font-size:8pt;">';
			str += '<select id="RA_School" name="RA_School" size="';
				if (RA_CtrlWin.RA.RAif.vars['Schools'].length == 1) {
			str += '2';
				} else if (RA_CtrlWin.RA.RAif.vars['Schools'].length > 9) {
			str += '9';
				} else {
			str += Number(RA_CtrlWin.RA.RAif.vars['Schools'].length+1);
				}
			str += '">';
				for ( var i=0; i<RA_CtrlWin.RA.RAif.vars['Schools'].length; i++ ) {
			str += '<option value="'+ i +'">';
			str += RA_CtrlWin.RA.RAif.vars['Schools'][i].Name;
			str += '</option>'
				}
			str += '</select>';
			str += '</p>';
			}
			str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="40" class="RA_button">'+ ButtonHTML('NEXT', 'JavaScript:RA_goCheckOutLookupSchool()', '', 'primary', false, 'medium', 'style="float:none; text-align:center"') +'</td>';
			str += '<td width="170" class="RA_button">'+ ButtonHTML('BACK TO MY SHOPPING CART', 'JavaScript:RA_BackToCart()', '', 'primary', false, 'medium', 'style="float:none; text-align:center"') +'</td>';
			str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
		break;
		case 'checkoutlookingupschool' :
			str += '<p class="RA_formText">searching for zip code...</p>';
		break;
		case 'checkoutprompt' :
			str += '<p class="RA_formTitle">Checking out...</p>';
//			str += '<p class="RA_formText">A new window will open and take you through the check out and payment process using PayPal, a safe and widely trusted internet payment website. You will need to register an account with PayPal, or log in if you already have one. Your PayPal account is different from the account you log in with here.</p>';
//			str += '<p class="RA_formText">You must complete the payment process in the PayPal pop-up window before you can finish unlocking your selected premium resources. At the end of the payment process, you will see an orange button labelled "CLICK HERE TO FINISH UNLOCKING YOUR PREMIUM RESOURCES". You must click this button to confirm your purchase and return to this website with your resources unlocked. You can cancel your purchase at any time in the PayPal pop-up window.</p>';
			str += '<p class="RA_formText">In order to collect your payment securely, we\'re going to link you PayPal. At the end of the payment process, you will see an orange button labelled "CLICK HERE TO FINISH UNLOCKING YOUR PREMIUM RESOURCES". Click that button to confirm your purchase and return to this website with your resources unlocked. You can cancel your purchase at any time in the PayPal pop-up window and return to this website.</p>';
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="105" class="RA_button">'+ ButtonHTML('CHECK OUT NOW', 'JavaScript:RA_CheckOut()', '', 'primary', false, 'medium', 'style="float:none; text-align:center"') +'</td>';
			str += '<td width="170" class="RA_button">'+ ButtonHTML('BACK TO MY SHOPPING CART', 'JavaScript:RA_BackToCart()', '', 'primary', false, 'medium', 'style="float:none; text-align:center"') +'</td>';
			str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
		break;
		case 'checkingout' :
			str += '<p class="RA_formText">checking out...</p>';
			str += '<p class="RA_formText">You must complete the payment process in the check out pop-up window before you can finish unlocking your selected premium resources.</p>';
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="170" class="RA_button">'+ ButtonHTML('BACK TO MY SHOPPING CART', 'JavaScript:RA_BackToCart()', '', 'primary', false, 'medium', 'style="float:none; text-align:center"') +'</td>';
			str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
		break;
		case 'checkedout' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formTitle">Your resource';
				if (RA_CtrlWin.RA.Cart.Items_InCart_ct > 1) {
					str += 's have';
				} else {
					str += ' has';
				}
				str += ' been unlocked</p>';
				for (var iitem in RA_CtrlWin.RA.Cart.Items) {if (RA_CtrlWin.RA.Cart.Items.hasOwnProperty(iitem)) {
					if (RA_CtrlWin.RA.Cart.Items[iitem].InCart) {
				str += '<p class="RA_formText">'+ RA_CtrlWin.RA.Cart.Items[iitem].Product.DisplayAll('form') +'</p>';
					}
				}}
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_FormCartContinue()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
			} else {
				str += '<p class="RA_formText">';
				str += 'You are not logged in.  <a href="JavaScript:RA_ShowLogin(\'login\',true);">Log in here</a>, or <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			}
		break;
	//  ********************************************************************************
		case 'updateprofile' :
			str += '<p class="RA_formTitle">Update your profile information</p>';
			if (RA_CtrlWin.RA.CurrentUser==null) {
				str += '<p class="RA_formText">';
				str += 'You are not logged in.  <a href="JavaScript:RA_ShowLogin(\'login\',true);">Log in here</a>';
				str += '</p>';
			} else {
				str += '<p id="RA_formError_updateprofile" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</p>';

				str += '<form name="RA_UpdateProfile" action="JavaScript:RA_goUpdateProfile();">';
				str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td valign="top" width="10" class="RA_formLabel"><nobr>First and last name:&nbsp;</nobr></td>';
				str += '<td valign="top" width="150" class="RA_formField">';
				str += '<div id="RA_editName" style="display:none">';

				str += '<table border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td valign="top" width="10" class="RA_formField"><input maxlength="50" type="text" id="RA_sUserFirstName" name="fname" value="'+ RA_CtrlWin.RA.RAif.vars['sUserFirstName'] +'"/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_sUserFirstName_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td valign="top" width="10" class="RA_formField"><nobr>&nbsp;<input maxlength="50" type="text" id="RA_sUserLastName" name="lname" value="'+ RA_CtrlWin.RA.RAif.vars['sUserLastName'] +'"/></nobr></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_sUserLastName_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr></table>';

				str += '</div>';
				str += '<div id="RA_showName" class="RA_formShow" style="display:block"><nobr>'+ RA_CtrlWin.RA.RAif.vars['sUserFirstName'] +'&nbsp;'+ RA_CtrlWin.RA.RAif.vars['sUserLastName'] +'&nbsp;&nbsp;&nbsp;&nbsp;<a class="RA_editlink" href="JavaScript:void(0);" onclick="document.getElementById(\'RA_editName\').style.display=\'block\';document.getElementById(\'RA_showName\').style.display=\'none\';">edit</a></nobr></div>';
				str += '</td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr><tr>';

				str += '<td valign="top">&nbsp;</td><td valign="top">&nbsp;</td><td valign="top">&nbsp;</td>';
				str += '</tr><tr>';

				str += '<td valign="top" width="10" class="RA_formLabel"><nobr>E-mail address:&nbsp;</nobr></td>';
				str += '<td valign="top" width="10" class="RA_formField">';
				str += '<div id="RA_showEmail" class="RA_formShow" style="display:block"><nobr>'+ RA_CtrlWin.RA.RAif.vars['sUserEmail'] +'&nbsp;&nbsp;&nbsp;&nbsp;<a class="RA_editlink" href="JavaScript:void(0);" onclick="RA_doChangeEmail()">edit</a></nobr></div>';
				str += '<div id="RA_editEmail" style="display:none">';
				str += '<table border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #ff0000;"><tr>';
				str += '<td valign="top" width="10">&nbsp;</td><td valign="top" width="10">&nbsp;</td><td valign="top">&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td valign="top" width="10" class="RA_formLabel"><nobr>Edit your e-mail address:&nbsp;</nobr></td>';
				str += '<td valign="top" width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_sUserEmail" name="email" value="'+ RA_CtrlWin.RA.RAif.vars['sUserEmail'] +'"/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_sUserEmail_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td valign="top" width="10" class="RA_formLabel"><nobr>Confirm your new e-mail address:&nbsp;</nobr></td>';
				str += '<td valign="top" width="10" class="RA_formField"><input maxlength="150" type="text" id="RA_sUserEmail_confirm" name="email_confirm" value=""/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_sUserEmail_confirm_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td valign="top">&nbsp;</td><td valign="top">&nbsp;</td><td valign="top">&nbsp;</td>';
				str += '</tr></table>';
				str += '</div>';
				str += '</td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr><tr>';

				str += '<td valign="top">&nbsp;</td><td valign="top">&nbsp;</td><td valign="top">&nbsp;</td>';
				str += '</tr><tr>';

				str += '<td valign="top" width="10" class="RA_formLabel"><nobr>Password:&nbsp;</nobr></td>';
				str += '<td valign="top" width="10" class="RA_formField">';
				str += '<div id="RA_showPw" class="RA_formShow" style="display:block"><nobr>**********&nbsp;&nbsp;&nbsp;&nbsp;<a class="RA_editlink" href="JavaScript:void(0);" onclick="RA_doChangePw()">change password</a></nobr></div>';
				str += '<div id="RA_changePw" style="display:none;">';
				str += '<table border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #ff0000;"><tr>';
				str += '<td valign="top" width="10">&nbsp;</td><td valign="top" width="10">&nbsp;</td><td valign="top">&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td valign="top" width="10" class="RA_formLabel"><nobr>Current password:&nbsp;</nobr></td>';
				str += '<td valign="top" width="10" class="RA_formField"><input type="password" maxlength="16" id="RA_sOldPwd" name="pw" value="" style="width:90px;"/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_sOldPwd_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td valign="top" width="10" class="RA_formLabel"><nobr>New password:&nbsp;</nobr></td>';
				str += '<td valign="top" width="10" class="RA_formField"><input type="password" maxlength="16" id="RA_sNewPwd" name="newpw" value="" style="width:90px;"/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_sNewPwd_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td valign="top" width="10" class="RA_formLabel"><nobr>Confirm new password:&nbsp;</nobr></td>';
				str += '<td valign="top" width="10" class="RA_formField"><input type="password" maxlength="16" id="RA_sVPwd" name="vpw" value="" style="width:90px;"/></td>';
				str += '<td width="10" valign="middle"><nobr><div id="RA_sVPwd_error" class="RA_formFieldError">&lt;&lt;</div></nobr></td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td valign="top">&nbsp;</td><td valign="top">&nbsp;</td><td valign="top">&nbsp;</td>';
				str += '</tr></table>';
				str += '</div>';

				str += '</td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td valign="top">&nbsp;</td><td valign="top">&nbsp;</td><td valign="top">&nbsp;</td>';
				str += '</tr><tr>';
				str += '<td valign="top"></td><td class="RA_formField" valign="top">';
				str += '<div id="RA_editLogin" style="display:none;width:550px;color:#ee0000;">You have chosen to change your e-mail address and/or password. You must use these to log in again. Please confirm your the changes above before saving.</div>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td valign="top" width="105" class="RA_button">'+ ButtonHTML("SAVE CHANGES", "JavaScript:RA_goUpdateProfile();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td valign="top" width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '</tr></table>';
				str += '</td>';
				str += '<td valign="top">&nbsp;</td>';
				str += '</tr></table>';
				str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
			}
		break;
		case 'updatingprofile' :
			str += '<p class="RA_formText">saving changes to your profile...</p>';
		break;
		case 'updatedprofile' :
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'Your changes have been saved. You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_FormContinue();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '</tr></table>';
			} else {
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RA_ShowLogin(\'login\',true);">log in</a> - <a href="JavaScript:RA_FormCancel()">cancel</a>';
				str += '</p>';
			}
		break;
	//  ********************************************************************************
		case 'quizprompt' :
RA_CtrlWin.RA.RAif.vars['sInstructorEmailSKIP'] = false;
			str += '<div id="RA_formError_quizprompt" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</div>';

//			str += '<p class="RA_formText">You do not have to enter your instructor\'s email address to do this exercise, but if your instructor wants to see your results, you will need to enter it. By entering your instructor\'s e-mail address, a copy of your quiz results will be sent to a report your instructor can access.</p>';
			str += '<p id="RA_form_quizpromptInstrux" class="RA_formText">Please enter your instructor\'s email address.</p>';
			str += '<form name="RA_QuizPrompt" action="JavaScript:RA_goQuizPrompt();">';
			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td valign="top" width="10" class="RA_formLabel"><nobr>Instructor e-mail address:&nbsp;</nobr></td>';
			str += '<td valign="top" width="10" class="RA_formField"><nobr><input maxlength="150" type="text" id="RA_sInstructorEmail" name="instructoremail" value="';
			if (RA_CtrlWin.RA.RAif.vars['sInstructorEmail']) {
			str += RA_CtrlWin.RA.RAif.vars['sInstructorEmail'];
			} else {
			str += RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail;
			}
			str += '"/>&nbsp;&nbsp;</nobr></td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
			str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_goQuizPrompt()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td width="340" class="RA_button">'+ ButtonHTML("SKIP THIS AND RECORD MY QUIZ RESULTS TO MY SCORECARD", "JavaScript:RA_CtrlWin.RA.RAif.vars['sInstructorEmailSKIP'] = true;document.getElementById(\'RA_sInstructorEmail\').value=\'\';RA_goQuizPrompt();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td width="210" class="RA_button">'+ ButtonHTML("CANCEL AND DO NOT TAKE THE QUIZ", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
/*
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_goQuizPrompt()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
*/
		break;
		case 'quizprompting' :
			str += '<p class="RA_formText">saving ...</p>';
		break;
		case 'quizpromptBAD' :
			str += '<p class="RA_formText"><b>'+ RA_CtrlWin.RA.RAif.vars['sInstructorEmail'] +'</b> does not yet exist in our system. Are you sure this is the correct e-mail address?</p>';
			str += '<p class="RA_formText">';
			str += '<input type="radio" name="RA_QuizPromptBad1" value="Yes" onclick="RA_QuizPromptBad1Yes()"/>Yes&nbsp;&nbsp;&nbsp;';
			str += '<input type="radio" name="RA_QuizPromptBad1" value="No" onclick="RA_QuizPromptBad1No()"/>No.';
			str += '</p>';
			str += '<br/>';
		break;
		case 'quizprompted' :
			setTimeout('RA_QuizClassPromptedYes()', 5);
/*
			str += '<div id="RA_formError_quizprompt" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</div>';
			str += '<p class="RA_formText">';
			if (RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail=='') {
					str += 'No instructor e-mail address has been saved with your profile. If your instructor wishes to view your quiz results, you will need to update your profile. You can do so now, or next time you visit.';
			} else {
					str += 'Congratulations. The e-mail address <b>'+ RA_CtrlWin.RA.CurrentUser.SiteLogins[RA_CtrlWin.RA.CurrentSite.ID].InstructorEmail +'</b> has been saved with your profile as your instructor\'s e-mail address, and now your instructor will be able to view results on your quizzes and exercises. If you need to change the e-mail address, or other elements of your profile, you can do so by choosing review profile now, or the next time you visit.';
			}
			str += '</p>';
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_QuizClassPromptedYes()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td width="60" class="RA_button">'+ ButtonHTML("CHANGE", "JavaScript:RA_reGoQuizPrompt()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
*/
		break;
	//  ********************************************************************************
		case 'quizclassprompt' :
			str += '<div id="RA_formError_quizclassprompt" class="RA_formError">'+ RA_CtrlWin.RA.RAif.vars['Error'] +'</div>';
//alert(RA_CtrlWin.RA.CurrentUser.ClassLogins.length);

			// --------------------------------------------------------------
			str += '<div id="RA_quizclassprompt_1">';
//			str += '<p class="RA_formText">';
//			str += '1. Quiz Class Prompt';
//			str += '</p>';
			if (RA_CtrlWin.RA.RAif.vars['justloggedin']) {
				str += '<p class="RA_formText">';
				str += 'You are now logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				delete RA_CtrlWin.RA.RAif.vars['justloggedin'];
			}
			str += '<p class="RA_formText">Do you want your quiz score to be recorded into your instructor\'s gradebook?</p>';
			str += '<p class="RA_formText">';
			str += '<input type="radio" name="RA_QuizClassPrompt1" value="Yes" onclick="RA_QuizClassPrompt1Yes()"/>Yes&nbsp;&nbsp;&nbsp;';
			str += '<input type="radio" name="RA_QuizClassPrompt1" value="No" onclick="RA_QuizClassPrompt1No()"/>No.';
			str += '</p>';
			str += '<br/>';
			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="210" class="RA_button">'+ ButtonHTML("CANCEL AND DO NOT TAKE THE QUIZ", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
			str += '</div>';

			// --------------------------------------------------------------
			str += '<div id="RA_quizclassprompt_2">';
//			str += '<p class="RA_formText">';
//			str += '2. Join Class Prompt';
//			str += '</p>';
			str += '<p class="RA_formText">If your instructor gave you a gradebook ID, enter it here. Or enter your instructor\'s e-mail address.';
			str += '</p>';
			str += '<form name="RA_QuizJoinClass" action="JavaScript:RA_goQuizJoinClass();">';
			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td valign="top" width="10" class="RA_formField"><nobr><input maxlength="150" type="text" id="RA_sClassCode" name="RA_sClassCode" value=""/>&nbsp;&nbsp;</nobr></td>';
			str += '<td width="30" class="RA_button">'+ ButtonHTML("GO", "JavaScript:RA_goQuizJoinClass();", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
			str += '<input type="submit" name="submit" style="position:absolute;top:-500px;left:-500px"/></form>';
			str += '<br/>';
			str += '<table width="100%" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="340" class="RA_button">'+ ButtonHTML("SKIP THIS AND RECORD MY QUIZ RESULTS TO MY SCORECARD", "JavaScript:RA_QuizClassPrompt3Yes(null)", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td width="210" class="RA_button">'+ ButtonHTML("CANCEL AND DO NOT TAKE THE QUIZ", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
			str += '</div>';

			// --------------------------------------------------------------
			str += '<div id="RA_quizclassprompt_3">';
//			str += '<p class="RA_formText">';
//			str += '3. Class List';
//			str += '</p>';
			str += '<p class="RA_formText">Do you want your quiz score to be recorded into your instructor\'s gradebook?</p>';

			str += '<table class="RA_box_tbl" width="100%" border="0" cellpadding="0" cellspacing="0">';
			str += '<tr>';
			str += '<td class="RA_box_tbl_tl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_tr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_ml">&nbsp;</td>';
			str += '<td class="RA_box_tbl_mc">';

			str += '<p class="RA_formText"><b>Your saved gradebooks:</b></p>';
			str += '<table width="100%" border="0" cellpadding="3" cellspacing="10">';
				str += '<tr><td valign="top" width="10" class="RA_formLabel"><nobr><b>Instructor</b></nobr></td>';
				str += '<td valign="top" width="10" class="RA_formLabel"><nobr><b>Name</b></nobr></td>';
				str += '<td valign="top" width="100" class="RA_formLabel"><nobr><b>Description</b></nobr></td>';
//				str += '<td valign="top" width="10" class="RA_formLabel"><nobr><b>Expiration</b></nobr></td>';
				str += '<td width="10">&nbsp;</td>';
				str += '<td>&nbsp;</td></tr>';
				str += '<tr><td valign="top" colspan="5" style="border-top:1px solid #000; font-size:1px">&nbsp;</td></tr>';
			for (var i in RA_CtrlWin.RA.CurrentUser.ClassLogins) {if (RA_CtrlWin.RA.CurrentUser.ClassLogins.hasOwnProperty(i)) {
				var x = RA_CtrlWin.RA.CurrentUser.ClassLogins[i];
				str += '<tr><td valign="top" width="10" class="RA_formText"><nobr>'+x.Class.Creator.FName+'&nbsp;'+x.Class.Creator.LName+'</nobr></td>';
				str += '<td valign="top" width="10" class="RA_formText"><nobr>'+x.Class.Name+'</nobr></td>';
				str += '<td valign="top" width="100" class="RA_formLabel" style="padding-top:4px"><nobr>'+x.Class.Desc+'</nobr></td>';
//				str += '<td valign="top" width="10" class="RA_formLabel" style="padding-top:4px"><nobr>'+x.Class.Expiration+'</nobr></td>';
				str += '<td width="210" class="RA_button">'+ ButtonHTML("RECORD QUIZ RESULTS INTO THIS GRADEBOOK", "JavaScript:RA_QuizClassPrompt3Yes("+i+")", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td></tr>';
				str += '<tr><td valign="top" colspan="5" style="border-top:1px solid #888; font-size:1px">&nbsp;</td></tr>';
			}}
			str += '</table>';

			str += '</td>';
			str += '<td class="RA_box_tbl_mr">&nbsp;</td>';
			str += '</tr>';
			str += '<tr>';
			str += '<td class="RA_box_tbl_bl">&nbsp;</td>';
			str += '<td class="RA_box_tbl_bc">&nbsp;</td>';
			str += '<td class="RA_box_tbl_br">&nbsp;</td>';
			str += '</tr>';
			str += '</table>';

			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="200" class="RA_button">'+ ButtonHTML("USE A DIFFERENT GRADEBOOK", "JavaScript:RA_QuizClassPrompt3No()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td width="340" class="RA_button">'+ ButtonHTML("SKIP THIS AND RECORD MY QUIZ RESULTS TO MY SCORECARD", "JavaScript:RA_QuizClassPrompt3Yes(null)", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td width="210" class="RA_button">'+ ButtonHTML("CANCEL AND DO NOT TAKE THE QUIZ", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
			str += '</div>';

			// --------------------------------------------------------------
			str += '<div id="RA_quizclassprompt_4">';
//			str += '<p class="RA_formText">';
//			str += '6. Do not report results';
//			str += '</p>';


			if (RA_CtrlWin.RA.CurrentUser.ClassUsing == null) {
				str += '<p class="RA_formText">';
				str += 'Your quiz results will not be recorded into your instructor\'s gradebook. Do you want to continue?';
				str += '</p>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_QuizClassPromptedYes()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("GO BACK", "JavaScript:RA_QuizClassPromptedNo()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td width="210" class="RA_button">'+ ButtonHTML("CANCEL AND DO NOT TAKE THE QUIZ", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
			} else {
				str += '<p class="RA_formText">';
//alert(RA_CtrlWin.RA.CurrentUser.ClassUsing);
				str += 'Your quiz results will be recorded into <nobr><b>'+RA_CtrlWin.RA.CurrentUser.ClassUsing.Creator.FName+'&nbsp;'+RA_CtrlWin.RA.CurrentUser.ClassUsing.Creator.LName+'\'s</b></nobr> <nobr>('+RA_CtrlWin.RA.CurrentUser.ClassUsing.Creator.Email+')</nobr> gradebook <nobr>"'+RA_CtrlWin.RA.CurrentUser.ClassUsing.Name+'"</nobr>.';
				str += '</p>';
				str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_QuizClassPromptedYes()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td width="70" class="RA_button">'+ ButtonHTML("GO BACK", "JavaScript:RA_QuizClassPromptedNo()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td width="210" class="RA_button">'+ ButtonHTML("CANCEL AND DO NOT TAKE THE QUIZ", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
				str += '<td>&nbsp;</td>';
				str += '</tr></table>';
			}

			str += '</div>';

			// --------------------------------------------------------------
			str += '<div id="RA_quizclassprompt_5" style="display:none;">';
			str += '<p class="RA_formText">saving ...</p>';
			str += '</div>';
		break;
		case 'quizjoiningclass' :
			str += '<p class="RA_formText">saving ...</p>';
		break;
		case 'quizjoinedclass' :
			// --------------------------------------------------------------
			str += '<div id="RA_formError_quizclassprompt" class="RA_formError"></div>';
			// --------------------------------------------------------------
			str += '<div id="RA_quizclassprompt_5" style="display:block;">';
			str += '<p class="RA_formText">saving ...</p>';
			str += '</div>';
			str += '<div id="RA_quizclassprompt_4" style="display:none">';


			if (RA_CtrlWin.RA.CurrentUser.ClassUsing == null) {
				str += '<p class="RA_formText">';
				str += 'Your quiz results will not be recorded into your instructor\'s gradebook.';
				str += '</p>';
			} else {
				str += '<p class="RA_formText">';
//alert(RA_CtrlWin.RA.CurrentUser.ClassUsing);
				str += 'Your quiz results will be recorded into <nobr><b>'+RA_CtrlWin.RA.CurrentUser.ClassUsing.Creator.FName+'&nbsp;'+RA_CtrlWin.RA.CurrentUser.ClassUsing.Creator.LName+'\'s</b></nobr> <nobr>('+RA_CtrlWin.RA.CurrentUser.ClassUsing.Creator.Email+')</nobr> gradebook <nobr>"'+RA_CtrlWin.RA.CurrentUser.ClassUsing.Name+'"</nobr>.';
				str += '</p>';
			}
			str += '</div>';
			str += '<table class="RA_buttons" border="0" cellpadding="0" cellspacing="0"><tr>';
			str += '<td width="70" class="RA_button">'+ ButtonHTML("CONTINUE", "JavaScript:RA_FormContinue()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td width="60" class="RA_button">'+ ButtonHTML("CANCEL", "JavaScript:RA_FormCancel()", "", "primary", false, "medium", "style='float:none; text-align:center'") +'</td>';
			str += '<td>&nbsp;</td>';
			str += '</tr></table>';
		break;
	//  ********************************************************************************
		case 'nosite' :
			str += '<p style="text-align:right;font-size:10px;">';
			str += '<a href="JavaScript:RA_FormCancel()">close</a>';
			str += '</p>';
			str += '<p class="RA_formTitle">';
			str += '<b>Site error.</b>';
			str += '</p>';
			str += RA_CtrlWin.RA.DisplayAll();
		break;
	//  ********************************************************************************
		default :
			str += '<p style="text-align:right;font-size:10px;">';
			str += '<a href="JavaScript:RA_FormCancel()">close</a>';
			str += '</p>';
			if (RA_CtrlWin.RA.dev_check()) {
				str += '<p class="RA_formText"><b>';
				str += 'RA info';
				str += '</b></p>';
			}
			if (RA_CtrlWin.RA.CurrentUser!=null) {
				str += '<p class="RA_formText">';
				str += 'You are logged in as '+RA_CtrlWin.RA.CurrentUser.FName+' '+RA_CtrlWin.RA.CurrentUser.LName+' ('+RA_CtrlWin.RA.CurrentUser.Email+') ';
				str += '</p>';
				str += '<p class="RA_formText">';
				str += '<a href="JavaScript:RAXS_Logout(true);">Log out here</a>';
				str += '</p>';
				if (RA_CtrlWin.RA.dev_check()) {
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_ShowLogin(\'checkemail\',true);">Register</a>';
					str += '</p>';
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_Reload(\'quizprompt\',true);">Quiz prompt (instructor email)</a>';
					str += '</p>';
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_Reload(\'quizclassprompt\',true);">Quiz prompt (class)</a>';
					str += '</p>';
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_Reload(\'checkcode\',true);">Enter activation code</a>';
					str += '</p>';
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_Reload(\'cart\',true);">Cart</a>';
					str += '</p>';
				}
			} else {
				str += '<p class="RA_formText">';
				str += 'You are not logged in.  <a href="JavaScript:RA_ShowLogin(\'login\',true);">Log in here</a>';
				str += '</p>';
				if (RA_CtrlWin.RA.dev_check()) {
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_ShowLogin(\'checkemail\',true);">Register</a>';
					str += '</p>';
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_Reload(\'quizprompt\',true);">Quiz prompt (instructor email)</a>';
					str += '</p>';
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_Reload(\'quizclassprompt\',true);">Quiz prompt (class)</a>';
					str += '</p>';
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_Reload(\'checkcode\',true);">Enter activation code</a>';
					str += '</p>';
					str += '<p class="RA_formText">';
					str += '<a href="JavaScript:RA_Reload(\'cart\',true);">Cart</a>';
					str += '</p>';
				}
			}
			str += RA_CtrlWin.RA.DisplayAll();
	}
	if (RA_CtrlWin.RA.dev_check()) {
	str += '<p id="tester" style="color:#ccc;font-size:10px;padding:0;margin:0;">testing: '+ RA_CtrlWin.RA.RAif.state.current() +'</p>';
	}
	str += '<br/><br/><div style="font-size:9pt;"><hr/>Having trouble? <a target="blank" href="http://www.bfwpub.com/newcatalog.aspx?page=support\\techsupport.html">Click here for technical support</a></div>'

	$('#RA_Page').html( str );

//alert('RA_DrawPage 2');
	RAif_Resize();

//alert('RA_DrawPage 3');
//window.self.focus();
}



function RAWS_cleanInput(val,type) {
	switch (type) {
	case '' :
		break;
	default :
		val = val.replace('<','').replace('>','');
	}
	return val;
}

function RAif_validEmail(email) {
	try {
		var valid1 = email.indexOf('.') > -1;
		var valid2 = email.indexOf('..') == -1;
		var valid3 = email.indexOf('@') > -1;
		var valid4 = email.indexOf('@') == email.lastIndexOf('@');
		var rexpStr = '[\!#$%^\*< >\(\)\+\\\\\&\\s]';
		var rexp = new RegExp( rexpStr,'gim');
		var valid5 = !rexp.test(email);
		var valid6 = true;
		valid6 = (email.indexOf("\'")>-1) ? false : true;
		var valid = valid1 && valid2 && valid3 && valid4 && valid5 && valid6;
		return valid
	} catch(e) {
		return false;
	}
}



//  ********************************************************************************

function RAXS_Logout (nopop) {
	if (!nopop) RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push('loggingout');
	RA_DrawPage();
	RA_CtrlWin.RA.ClearUser();
	RA_CtrlWin.RA.RAif.state.pop();
	var inuid = 0;

	RAif_RAXS_ReInit ( 'loggedout', nopop );
}

function RA_Reload (formstate, nopop) {
	if (!nopop) RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push(formstate);
	window.location.reload();
}

function RA_ShowLogin (formstate, nopop) {
	if (!nopop) RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push(formstate);
//	window.location.reload();
	RA_DrawPage();
	RAif_Resize();
}

function RAXS_Login_continue ( uid, nextstate, nopop ) {
//alert( 'RAXS_Login_continue: '+ uid +' - '+ nextstate );
	RAif_RAXS_ReInit ( nextstate, nopop, uid );
}

//  ********************************************************************************

function RAif_RAXS_ReInit ( nextstate, nopop, uid ) {
//alert( 'RAif_RAXS_ReInit: '+ uid +' - '+ nextstate );
	if (!nopop) RA_CtrlWin.RA.RAif.state.pop();
	RA_CtrlWin.RA.RAif.state.push( nextstate );
	if (uid) {
		RAif_RAXS_Init(uid)
	} else if (RA_CtrlWin.RA.CurrentUser) {
		RAif_RAXS_Init(RA_CtrlWin.RA.CurrentUser.ID)
	} else {
		RAif_RAXS_Inited();
	}
}

function RAif_RAXS_Init (uid) {
//alert('RAif_RAXS_Init');
	RA_CtrlWin.setCookie2('RAXSu',uid);
	RA_CtrlWin.setCookie2('RAXSsaved','');
	RA_CtrlWin.RA.RAXS.InitSession( RA_CtrlWin.RA.RAif._win.RAif_RAXS_Inited );
}
function RAif_RAXS_Inited () {
//alert('RAif_RAXS_Inited');
	RA_CtrlWin.RA.RAif.updated = true;
	RA_CtrlWin.RA.RAif.updated_needsRAXS = true;
	RA_CtrlWin.RA.RAif._if.src = '/BFWglobal/RAg/v1.2/RAif.html?clear=true';
}


