# Kuh-Bilder für die 3D-Stallvorschau

Hier kommen die Porträtfotos der Kühe rein, die im 3D-Stall (`/stall3d`) auf den
vertikalen Bildflächen im Fressgitter angezeigt werden.

## Dateiname = Stallplatz-Nummer

Benenne jedes Foto nach der Platznummer der Kuh, mit `.png` als Endung:

```
public/assets/kuh_bilder/
  1.png    ← Stallplatz 1 (z. B. Alma)
  2.png    ← Stallplatz 2 (z. B. Berta)
  3.png    ← Stallplatz 3
  ...
  30.png   ← Stallplatz 30
```

Die Stallplatz-Nummer entspricht der `nr` der Kuh in `lib/data.ts`.

## Was passiert, wenn ein Bild fehlt?

Die 3D-Szene lädt das Bild beim Start. Schlägt das Laden fehl (Datei fehlt,
Tippfehler, falsches Format), wird automatisch ein generischer Kuh-Platzhalter
mit der Stallplatz-Nummer gerendert.

## Bildempfehlungen

- **Format**: PNG mit transparentem Hintergrund (Kuh freigestellt) wirkt am besten
- **Seitenverhältnis**: Hochformat 4 : 5 oder 3 : 4 passt zur Bildfläche
  (1,4 m breit × 1,9 m hoch in 3D-Einheiten)
- **Auflösung**: 800 – 1 200 px breit reicht völlig aus
- **Dateigröße**: ≤ 500 KB pro Bild, damit die Szene zügig lädt
