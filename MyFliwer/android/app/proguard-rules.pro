# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
-dontwarn com.facebook.imagepipeline.animated.factory.AnimatedFactoryImpl

# Evita error por clase JP2 faltante en pdfbox-android
-dontwarn com.gemalto.jp2.**
-dontnote com.gemalto.jp2.**

# Mantiene las clases de PDFBox (por si R8 las elimina)
-keep class com.tom_roush.pdfbox.** { *; }