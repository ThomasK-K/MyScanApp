# Debugging deiner React Native App
Nach der Installation deiner Development-Build-App gibt es mehrere Wege, wie du die App debuggen kannst:

## Direktes Debugging in der App
Öffne die App auf deinem Gerät
Schüttle das Gerät oder drücke die Menütaste (bei Emulatoren Cmd+M oder Ctrl+M) um das Developer-Menü zu öffnen
Wähle "Debug JS Remotely" oder "Debug"
## React Native Debugger verwenden
Installiere React Native Debugger (separates Tool): https://github.com/jhen0409/react-native-debugger
Starte React Native Debugger auf deinem Computer (Port 8081)
Aktiviere Remote Debugging in der App
Die App verbindet sich automatisch mit dem Debugger
## Chrome DevTools verwenden
Aktiviere "Debug JS Remotely" in deiner App
Öffne Chrome und gehe zu http://localhost:8081/debugger-ui/
Öffne die Chrome DevTools (F12)
## Hermes Engine Debugging (wenn aktiviert)
Öffne Chrome und gehe zu chrome://inspect
Klicke auf "Configure" und füge localhost:8081 hinzu
Dein Gerät sollte unter "Remote Target" erscheinen
## React Native CLI Debugging



5. React Native CLI Debugging

# Starte den Metro Bundler mit Debugging-Optionennpx expo start --dev-client
6. Logs im Terminal anzeigen
```
# Android Logs anzeigen
adb logcat *:S ReactNative:V ReactNativeJS:V

# Nur Expo-/App-bezogene Logs filtern
adb logcat | grep -i "expo\|react"
```

### Android Logs anzeigen

```
adb logcat *:S ReactNative:V ReactNativeJS:V# Nur Expo-/App-bezogene Logs filternadb logcat | grep -i "expo\|react"
```
#### Breakpoints setzen
Bei Chrome DevTools: In den "Sources" Tab gehen, die relevante Datei öffnen und Breakpoints setzen
Bei VS Code: Breakpoints im Editor setzen und dann die Debug-Konfiguration für React Native starten

### Fehlerbehandlung
Red Screen (JS-Fehler) zeigt Details direkt in der App
Crash Logs werden in adb logcat angezeigt
Netzwerkanfragen können im Network-Tab des Debuggers überwacht werden
Benötigst du Hilfe bei einem bestimmten Debugging-Problem oder möchtest du wissen, wie man einen bestimmten Teil deiner App debuggt?

