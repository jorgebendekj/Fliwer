@ECHO OFF

call webpack --env production --progress

rem read -p "$*"

cd web/build
del .htaccess
mklink .htaccess ..\.htaccess
rmdir css
mklink /D css ..\css
rmdir js
mklink /D js ..\js
rmdir videos
mklink /D videos ..\videos
del favicon.png
mklink favicon.png ..\favicon.png
rmdir fonts
mklink /D fonts ..\..\MyFliwer\assets\fonts
rmdir .well-known
mklink /D .well-known ..\.well-known

rem read -p "$*"

@ECHO ON
