# Tuya/LSC Integration Hub – Android App

WebView-Wrapper für das Tuya/LSC WebRTC Livestream Integration Hub.

## Build

```bash
cd tuya-lsc-android
./gradlew assembleDebug
```

Die fertige APK liegt unter `app/build/outputs/apk/debug/app-debug.apk`.

## Installation

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## In Android Studio öffnen

Android Studio → `Open` → den Ordner `tuya-lsc-android/` wählen → Gradle Sync abwarten → Run.

## Technik

- Single-Activity-App mit `WebView`
- Lädt `app/src/main/assets/index.html`
- JS, DOM-Storage, Mixed-Content (für HLS-Streams), Auto-Play und Zoom aktiv
- minSdk 24, targetSdk 34
- Hardware-Back-Button navigiert WebView-History zurück

## Anpassen der UI

Die komplette Oberfläche ist `app/src/main/assets/index.html`. Änderungen dort genügen – kein Kotlin-Code anfassen.
