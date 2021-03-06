# usage: ./PxWebCustomEventLog  -computerName VSPXDEV02

Param(
  [string]$computerName
)

Remove-EventLog -computername $computerName -source PxWebAPI

Remove-EventLog -computername $computerName -logname PxWebAPI
Remove-EventLog -computername $computerName -logname Px_WebAPI

new-eventlog -computername $computerName -source PxWebAPI -logname Application
