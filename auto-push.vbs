Option Explicit

Dim shell, commitMessage, currentDateTime

Set shell = CreateObject("WScript.Shell")

' תאריך ושעה בפורמט קריא
currentDateTime = Now
commitMessage = "Auto sync - " & currentDateTime

' ביצוע הפקודות
shell.Run "git add .", 0, True
shell.Run "git commit -m """ & commitMessage & """", 0, True
shell.Run "git push", 0, True
