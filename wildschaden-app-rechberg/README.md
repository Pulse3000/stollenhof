# Wildschaden App Rechberg

Android-WebView-Hülle für die Web-App unter
`https://wildschaden-app-rechberg.base44.app/`.

## Eckdaten

- **App-Name:** Wildschaden App Rechberg
- **Package / applicationId:** `de.rechberg.wildschadenapp`
- **Min SDK:** 24 (Android 7.0)
- **Target / Compile SDK:** 34
- **Sprache:** Kotlin
- **UI:** View Binding + WebView in `ConstraintLayout`

## Projektstruktur

```
wildschaden-app-rechberg/
├── build.gradle.kts                 # Root-Build-Skript
├── settings.gradle.kts              # Modul-Includes
├── gradle.properties
├── gradle/wrapper/                  # Gradle 8.7 Wrapper
├── gradlew / gradlew.bat
└── app/
    ├── build.gradle.kts             # Modul-Build-Skript
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/de/rechberg/wildschadenapp/MainActivity.kt
        └── res/
            ├── layout/activity_main.xml
            ├── values/strings.xml
            ├── values/themes.xml
            ├── values/colors.xml
            ├── drawable/ic_launcher_foreground.xml
            ├── mipmap/...
            └── mipmap-anydpi-v26/...
```

## Bauen

### In Android Studio

1. `File > Open ...` und den Ordner `wildschaden-app-rechberg/` auswählen.
2. Gradle-Sync abwarten.
3. `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
4. Das APK liegt anschließend unter
   `app/build/outputs/apk/debug/app-debug.apk`.

### Über die Kommandozeile

```bash
cd wildschaden-app-rechberg
./gradlew assembleDebug
```

## Anpassungen

- **Ziel-URL:** `MainActivity.kt`, Zeile mit `loadUrl(...)`.
- **App-Name:** `app/src/main/res/values/strings.xml`.
- **Splash-/Theme-Farben:** `app/src/main/res/values/themes.xml` und
  `colors.xml`.
- **Launcher-Icon:** `app/src/main/res/drawable/ic_launcher_foreground.xml`
  (Vektor) und `colors.xml` (`ic_launcher_background`).
