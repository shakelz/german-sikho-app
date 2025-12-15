const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing react-native-tts...');

// Paths
const ttsPath = path.join(__dirname, '..', 'node_modules', 'react-native-tts', 'android');
const buildGradlePath = path.join(ttsPath, 'build.gradle');
const manifestPath = path.join(ttsPath, 'src', 'main', 'AndroidManifest.xml');

// 1. Fix build.gradle
if (fs.existsSync(buildGradlePath)) {
    const gradleContent = `
def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.0.0' // Updated gradle version
    }
}

apply plugin: 'com.android.library'

android {
    compileSdkVersion safeExtGet('compileSdkVersion', 33) // Updated to 33
    buildToolsVersion safeExtGet('buildToolsVersion', '33.0.0')

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 21) // Updated to 21
        targetSdkVersion safeExtGet('targetSdkVersion', 33) // Updated to 33
        versionCode 1
        versionName "1.0"
    }
    lintOptions {
        abortOnError false
    }
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
}
`;
    fs.writeFileSync(buildGradlePath, gradleContent);
    console.log('✅ Fixed build.gradle');
} else {
    console.warn('⚠️ build.gradle not found');
}

// 2. Fix AndroidManifest.xml
if (fs.existsSync(manifestPath)) {
    let manifestContent = fs.readFileSync(manifestPath, 'utf8');
    if (!manifestContent.includes('android:exported="true"')) {
        manifestContent = manifestContent.replace(
            '<service android:name=".TextToSpeechService" />',
            '<service android:name=".TextToSpeechService" android:exported="true" />'
        );
        fs.writeFileSync(manifestPath, manifestContent);
        console.log('✅ Fixed AndroidManifest.xml (added exported="true")');
    } else {
        console.log('ℹ️ AndroidManifest.xml already fixed');
    }
} else {
    console.warn('⚠️ AndroidManifest.xml not found');
}