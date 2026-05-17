# Zeiterfassung – Android App

Persönliche Zeiterfassung von täglichen Tätigkeiten. Minimales Design,
alle Daten werden **lokal auf dem Gerät** gespeichert (Room/SQLite),
kein Internet und kein Konto nötig.

## Funktionen

- Großer **„Hinzufügen“**-Button auf der Startseite
- Tätigkeit mit fester **Dauer in Minuten** erfassen
- Oder einen **Live-Timer starten** und später stoppen (läuft sekundengenau)
- Liste aller erfassten Tätigkeiten mit Start­zeit, Notiz und Gesamtdauer
- Einträge wieder löschen
- Helles & dunkles Design (folgt dem System)

## Fertige APK herunterladen (kein Build nötig)

Bei jedem Push baut GitHub Actions automatisch eine installierbare APK:

1. Im Repo auf **Actions → „Android Build“** den letzten Lauf öffnen und
   das Artefakt `zeiterfassung-debug-apk` herunterladen, **oder**
2. unter **Releases** das Release `zeiterfassung-latest` öffnen und
   `app-debug.apk` herunterladen.

APK auf das Android-Telefon kopieren, antippen und Installation aus
unbekannten Quellen erlauben. Mindestens Android 7.0 (API 24).

## Selbst bauen

Voraussetzung: JDK 17 und das Android SDK (z. B. via Android Studio).

```bash
cd android-app
./gradlew assembleDebug
```

Die fertige APK liegt danach unter
`app/build/outputs/apk/debug/app-debug.apk`.

Alternativ den Ordner `android-app/` direkt in Android Studio öffnen und
auf „Run“ drücken.

## Technik

- Kotlin, Jetpack Compose (Material 3)
- Room für lokale Speicherung
- minSdk 24, targetSdk 34
