﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.235
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

// 
// This source code was auto-generated by Microsoft.VSDesigner, Version 4.0.30319.235.
// 
#pragma warning disable 1591

namespace Bfw.PX.SSO.RAGetCourseSiteID {
    using System;
    using System.Web.Services;
    using System.Diagnostics;
    using System.Web.Services.Protocols;
    using System.ComponentModel;
    using System.Xml.Serialization;
    
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Web.Services.WebServiceBindingAttribute(Name="RAGetAgilixCourseIDSoap", Namespace="http://tempuri.org/")]
    public partial class RAGetAgilixCourseID : System.Web.Services.Protocols.SoapHttpClientProtocol {
        
        private System.Threading.SendOrPostCallback GetAgilixCourseIDOperationCompleted;
        
        private bool useDefaultCredentialsSetExplicitly;
        
        /// <remarks/>
        public RAGetAgilixCourseID() {
            this.Url = global::Bfw.PX.SSO.Properties.Settings.Default.Bfw_PX_SSO_RAGetCourseSiteID_RAGetAgilixCourseID;
            if ((this.IsLocalFileSystemWebService(this.Url) == true)) {
                this.UseDefaultCredentials = true;
                this.useDefaultCredentialsSetExplicitly = false;
            }
            else {
                this.useDefaultCredentialsSetExplicitly = true;
            }
        }
        
        public new string Url {
            get {
                return base.Url;
            }
            set {
                if ((((this.IsLocalFileSystemWebService(base.Url) == true) 
                            && (this.useDefaultCredentialsSetExplicitly == false)) 
                            && (this.IsLocalFileSystemWebService(value) == false))) {
                    base.UseDefaultCredentials = false;
                }
                base.Url = value;
            }
        }
        
        public new bool UseDefaultCredentials {
            get {
                return base.UseDefaultCredentials;
            }
            set {
                base.UseDefaultCredentials = value;
                this.useDefaultCredentialsSetExplicitly = true;
            }
        }
        
        /// <remarks/>
        public event GetAgilixCourseIDCompletedEventHandler GetAgilixCourseIDCompleted;
        
        /// <remarks/>
        [System.Web.Services.Protocols.SoapDocumentMethodAttribute("http://tempuri.org/GetAgilixCourseID", RequestNamespace="http://tempuri.org/", ResponseNamespace="http://tempuri.org/", Use=System.Web.Services.Description.SoapBindingUse.Literal, ParameterStyle=System.Web.Services.Protocols.SoapParameterStyle.Wrapped)]
        public SiteInfo GetAgilixCourseID(string sUrl) {
            object[] results = this.Invoke("GetAgilixCourseID", new object[] {
                        sUrl});
            return ((SiteInfo)(results[0]));
        }
        
        /// <remarks/>
        public void GetAgilixCourseIDAsync(string sUrl) {
            this.GetAgilixCourseIDAsync(sUrl, null);
        }
        
        /// <remarks/>
        public void GetAgilixCourseIDAsync(string sUrl, object userState) {
            if ((this.GetAgilixCourseIDOperationCompleted == null)) {
                this.GetAgilixCourseIDOperationCompleted = new System.Threading.SendOrPostCallback(this.OnGetAgilixCourseIDOperationCompleted);
            }
            this.InvokeAsync("GetAgilixCourseID", new object[] {
                        sUrl}, this.GetAgilixCourseIDOperationCompleted, userState);
        }
        
        private void OnGetAgilixCourseIDOperationCompleted(object arg) {
            if ((this.GetAgilixCourseIDCompleted != null)) {
                System.Web.Services.Protocols.InvokeCompletedEventArgs invokeArgs = ((System.Web.Services.Protocols.InvokeCompletedEventArgs)(arg));
                this.GetAgilixCourseIDCompleted(this, new GetAgilixCourseIDCompletedEventArgs(invokeArgs.Results, invokeArgs.Error, invokeArgs.Cancelled, invokeArgs.UserState));
            }
        }
        
        /// <remarks/>
        public new void CancelAsync(object userState) {
            base.CancelAsync(userState);
        }
        
        private bool IsLocalFileSystemWebService(string url) {
            if (((url == null) 
                        || (url == string.Empty))) {
                return false;
            }
            System.Uri wsUri = new System.Uri(url);
            if (((wsUri.Port >= 1024) 
                        && (string.Compare(wsUri.Host, "localHost", System.StringComparison.OrdinalIgnoreCase) == 0))) {
                return true;
            }
            return false;
        }
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Xml", "4.0.30319.225")]
    [System.SerializableAttribute()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://tempuri.org/")]
    public partial class SiteInfo {
        
        private string siteIDField;
        
        private string siteDescriptionField;
        
        private string baseURLField;
        
        private string agilixSiteIDField;
        
        /// <remarks/>
        public string SiteID {
            get {
                return this.siteIDField;
            }
            set {
                this.siteIDField = value;
            }
        }
        
        /// <remarks/>
        public string SiteDescription {
            get {
                return this.siteDescriptionField;
            }
            set {
                this.siteDescriptionField = value;
            }
        }
        
        /// <remarks/>
        public string BaseURL {
            get {
                return this.baseURLField;
            }
            set {
                this.baseURLField = value;
            }
        }
        
        /// <remarks/>
        public string AgilixSiteID {
            get {
                return this.agilixSiteIDField;
            }
            set {
                this.agilixSiteIDField = value;
            }
        }
    }
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    public delegate void GetAgilixCourseIDCompletedEventHandler(object sender, GetAgilixCourseIDCompletedEventArgs e);
    
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.0.30319.1")]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    public partial class GetAgilixCourseIDCompletedEventArgs : System.ComponentModel.AsyncCompletedEventArgs {
        
        private object[] results;
        
        internal GetAgilixCourseIDCompletedEventArgs(object[] results, System.Exception exception, bool cancelled, object userState) : 
                base(exception, cancelled, userState) {
            this.results = results;
        }
        
        /// <remarks/>
        public SiteInfo Result {
            get {
                this.RaiseExceptionIfNecessary();
                return ((SiteInfo)(this.results[0]));
            }
        }
    }
}

#pragma warning restore 1591