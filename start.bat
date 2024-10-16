@echo off
:START
echo Attempt to update PI-Archive...
git pull

echo Checking libraries...
call npm install || pause

echo Starting service...
node index.js
goto START
pause