﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.1
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Bfw.PX.Biz.Direct.Services.Properties {
    
    
    [global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Microsoft.VisualStudio.Editors.SettingsDesigner.SettingsSingleFileGenerator", "10.0.0.0")]
    internal sealed partial class Settings : global::System.Configuration.ApplicationSettingsBase {
        
        private static Settings defaultInstance = ((Settings)(global::System.Configuration.ApplicationSettingsBase.Synchronized(new Settings())));
        
        public static Settings Default {
            get {
                return defaultInstance;
            }
        }
        
        [global::System.Configuration.ApplicationScopedSettingAttribute()]
        [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
        [global::System.Configuration.SpecialSettingAttribute(global::System.Configuration.SpecialSetting.WebServiceUrl)]
        [global::System.Configuration.DefaultSettingValueAttribute("http://int-raws.bfwpub.com/RAWS3/CheckUserName/RACheckUserName.asmx")]
        public string Bfw_PX_Biz_Direct_Services_RA_CheckUsername_RACheckUsername {
            get {
                return ((string)(this["Bfw_PX_Biz_Direct_Services_RA_CheckUsername_RACheckUsername"]));
            }
        }
        
        [global::System.Configuration.ApplicationScopedSettingAttribute()]
        [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
        [global::System.Configuration.SpecialSettingAttribute(global::System.Configuration.SpecialSetting.WebServiceUrl)]
        [global::System.Configuration.DefaultSettingValueAttribute("http://int-raws.bfwpub.com/raws3/EnterActivationCode/RAEnterActivationCode.asmx")]
        public string Bfw_PX_Biz_Direct_Services_RA_EnterActivationCode_RAEnterActivationCode {
            get {
                return ((string)(this["Bfw_PX_Biz_Direct_Services_RA_EnterActivationCode_RAEnterActivationCode"]));
            }
        }
        
        [global::System.Configuration.ApplicationScopedSettingAttribute()]
        [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
        [global::System.Configuration.SpecialSettingAttribute(global::System.Configuration.SpecialSetting.WebServiceUrl)]
        [global::System.Configuration.DefaultSettingValueAttribute("http://int-raws.bfwpub.com/raws3/StudentRegistration/RAStudentRegistration.asmx")]
        public string Bfw_PX_Biz_Direct_Services_RA_StudentRegistration_RAStudentRegistration {
            get {
                return ((string)(this["Bfw_PX_Biz_Direct_Services_RA_StudentRegistration_RAStudentRegistration"]));
            }
        }
    }
}