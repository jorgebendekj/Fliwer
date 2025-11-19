#!/bin/bash

# Ejecutar webpack
webpack --env production --progress

# Pausa (equivalente a tu 'read' o 'pause'). 
# Está comentada porque en tu BAT tiene un 'rem' delante.
# read -p "Presiona Enter para continuar..."

cd web/build || exit

# 1. .htaccess
rm -f .htaccess
ln -s ../.htaccess .htaccess

# 2. css
rm -rf css
ln -s ../css css

# 3. js
rm -rf js
ln -s ../js js

# 4. videos
rm -rf videos
ln -s ../videos videos

# 5. .well-known
rm -rf .well-known
ln -s ../.well-known .well-known

# 6. favicon.png
rm -f favicon.png
ln -s ../favicon.png favicon.png

# 7. fonts
# Nota: Asegúrate que la ruta ../../MyFliwer... es correcta en tu servidor Linux
rm -rf fonts
ln -s ../../MyFliwer/assets/fonts/ fonts

# Pausa final (comentada igual que en el BAT)
# read -p "Presiona Enter para finalizar..."

# Comandos node comentados al final del BAT
# ../scripts
##node yui-compressor-bundle.js
#node remove-comments-bundle.js