Set WshShell = CreateObject("WScript.Shell") 
WshShell.Run chr(34) & "C:\Users\Eliran Ashwal\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup" & Chr(34), 0
Set WshShell = Nothing