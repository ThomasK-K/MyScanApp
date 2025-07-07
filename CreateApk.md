# Erstellen einer Android APK ohne EAS

Diese Anleitung beschreibt, wie du für die MyScanApp eine APK-Datei ohne EAS (Expo Application Services) erstellst.

## Voraussetzungen

1. **Node.js und npm**: Stellen sicher, dass du aktuelle Versionen installiert hast
   ```bash
   node --version  # Sollte v16+ sein
   npm --version   # Sollte 8+ sein
   ```

2. **Java Development Kit (JDK)**: JDK 11 oder neuer wird benötigt
   ```bash
   javac --version  # Sollte 11+ sein
   ```
   Falls nicht installiert: `sudo apt install openjdk-11-jdk` (Ubuntu/Debian)

3. **Android SDK**: Das Android Software Development Kit muss installiert sein
   - Android Studio (empfohlen) oder
   - Standalone Android SDK mit folgenden Komponenten:
     - Android SDK Build-Tools
     - Android SDK Platform-Tools
     - Android SDK Platform (API 33+)
     - Android SDK Command-line Tools

4. **Umgebungsvariablen**: Diese müssen korrekt gesetzt sein
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```
   (Füge diese Zeilen zu deiner `~/.bashrc` oder `~/.zshrc` hinzu)

## APK erstellen

### 1. Native Projektdateien erzeugen

```bash
npx expo prebuild --platform android
```

### 2. APK bauen

```bash
cd android
chmod +x ./gradlew  # Falls erforderlich

# NODE_ENV setzen (wichtig für Expo-Konfigurationen)
export NODE_ENV=production  # Für Release-Builds
# ODER
export NODE_ENV=development  # Für Debug-Builds

# APK bauen
./gradlew assembleRelease  # Release-Version
```

Für eine Debug-Version (unsigniert und einfacher zu installieren):
```bash
export NODE_ENV=development
./gradlew assembleDebug
```

#### Fehlerbehebung: Task :expo-constants:createExpoConfig

Wenn du eine Fehlermeldung wie `Task :expo-constants:createExpoConfig - The NODE_ENV environment variable is required but was not specified` erhältst:

1. Setze die NODE_ENV Umgebungsvariable:
   ```bash
   export NODE_ENV=production  # oder development
   ```

2. Falls der Fehler weiterhin auftritt, versuche es mit diesem Workaround:
   ```bash
   NODE_ENV=production ./gradlew assembleRelease
   ```

#### Fehlerbehebung: Veraltete Gradle-Funktionen

Die Warnung "Deprecated Gradle features were used in this build" ist nur ein Hinweis und verhindert nicht den Build-Prozess. Sie weist darauf hin, dass in einer zukünftigen Gradle-Version (9.0) einige verwendete Funktionen nicht mehr unterstützt werden.

Um dieses Problem zu beheben, könntest du erwägen:

1. Expo auf eine neuere Version zu aktualisieren
2. Nach dem `prebuild` die Gradle-Dateien zu aktualisieren:
   ```bash
   # In android/build.gradle die Gradle-Version prüfen und ggf. aktualisieren
   # Stelle sicher, dass alle Plugins kompatible Versionen verwenden
   ```

### 3. APK-Dateien finden

- **Release-Version**: `android/app/build/outputs/apk/release/app-release.apk`
- **Debug-Version**: `android/app/build/outputs/apk/debug/app-debug.apk`

## Signieren der APK (für Release-Versionen)

Für eine offiziell nutzbare Release-Version musst du die APK signieren:

### Keystore erstellen (falls noch nicht vorhanden)

```bash
keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### signing.properties Datei erstellen

Erstelle die Datei `android/app/signing.properties` mit:
```properties
STORE_FILE=path/to/my-release-key.keystore
STORE_PASSWORD=*****
KEY_ALIAS=my-key-alias
KEY_PASSWORD=*****
```

### build.gradle anpassen

Füge in `android/app/build.gradle` hinzu:
```gradle
def signingProperties = new Properties()
def signingPropertiesFile = rootProject.file('app/signing.properties')
if (signingPropertiesFile.exists()) {
    signingProperties.load(new FileInputStream(signingPropertiesFile))
}

android {
    // ...existing config...
    signingConfigs {
        release {
            storeFile signingProperties['STORE_FILE'] ? file(signingProperties['STORE_FILE']) : null
            storePassword signingProperties['STORE_PASSWORD']
            keyAlias signingProperties['KEY_ALIAS']
            keyPassword signingProperties['KEY_PASSWORD']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ...existing release config...
        }
    }
}
```

Version findet man unter
android/app/build/outputs/apk/debug/app-debug.apk



Ja, du kannst eine APK ohne EAS (Expo Application Services) erstellen, indem du den traditionellen React Native Ansatz mit "Expo prebuild" und dem Android-Build-System verwendest. Hier ist eine Anleitung dafür:

### 1. Erstelle eine Expo-Prebuild-Version (Bare Workflow)

```bash
npx expo prebuild --platform android
```

Dieser Befehl generiert die nativen Android-Projektdateien auf Basis deiner Expo-Konfiguration.

### 2. Navigiere zum Android-Verzeichnis

```bash
cd android
```

### 3. Erstelle die APK mit Gradle

```bash
./gradlew assembleRelease
```

Wenn du Probleme mit der Ausführungsberechtigung hast:

```bash
chmod +x ./gradlew
./gradlew assembleRelease
```

### 4. Signieren der APK (Optional, aber empfohlen)

Deine fertige APK findest du unter:
```
android/app/build/outputs/apk/release/app-release.apk
```

Wenn du die Debug-Version bevorzugst (nicht signiert):

```bash
./gradlew assembleDebug
```

Die Debug-APK findest du unter:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Wichtig zu beachten:

1. Dieser Prozess konvertiert dein Projekt in ein Expo "Bare Workflow" Projekt - du kannst danach nicht mehr einfach zurück zu einem reinen Expo-Managed Workflow wechseln.

2. Du solltest sicherstellen, dass dein app.json alle notwendigen Android-Konfigurationsdetails enthält, besonders:
   - package-Name
   - versionCode
   - versionName

3. Für eine Release-Version musst du einen Signing-Key erstellen und die signing config in der build.gradle anpassen.

