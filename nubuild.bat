@ECHO OFF
ECHO (1/5) Gathering dependencies, please wait...
CALL npm i --save-dev >nul 2>nul
ECHO (2/5) Rebuilding dependencies, please wait...
CALL npm rebuild >nul 2>nul
ECHO (3/5) Preparing to build BeRP, please wait...
CALL npm run lint >nul 2>nul
ECHO (4/5) Finalizing dependencies for BeRP, please wait...
CALL npm rebuild >nul 2>nul
ECHO (5/5) Building BeRP, please wait...
CALL npm run build >nul 2>nul
ECHO Build complete!
IF EXIST "C:\Windows\Media\tada.wav" GOTO tada
goto:bloop
:tada
powershell -c (New-Object Media.SoundPlayer "C:\Windows\Media\tada.wav").PlaySync();
goto:fund
:bloop
rundll32 user32.dll,MessageBeep
goto:fund
:fund
ECHO.
ECHO (Extra credit) Authors of this code are looking for funding...
ECHO Consider supporting the author(s)?
ECHO Choices: [Y]es (default), [N]o 
SET /p choice=
if /i "%choice%"=="n" GOTO done
if /i "%choice%"=="N" GOTO done
if /i "%choice%"=="no" GOTO done
goto:sponsor
:sponsor
CALL npm fund
goto:done
:done
PAUSE