Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "auto-push.bat" & chr(34), 0
Set WshShell = Nothing
