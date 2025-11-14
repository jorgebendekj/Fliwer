#!/usr/bin/env sh

webpack --env production --progress
read -p "$*"
cd web/build
ln -s ../.htaccess .htaccess
ln -s ../css css
ln -s ../js js
ln -s ../videos videos
ln -s ../.well-known .well-known
ln -s ../favicon.png favicon.png
ln -s ../../MyFliwer/assets/fonts/ fonts
read -p "$*"
# ../scripts
##node yui-compressor-bundle.js
#node remove-comments-bundle.js
