# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native Config
-keep class com.lugg.ReactNativeConfig.** { *; }

# Additional obfuscation for API services (security)
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Keep React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Security: Obfuscate everything else to protect API keys and logic
