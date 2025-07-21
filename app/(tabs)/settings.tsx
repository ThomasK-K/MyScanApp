import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CrossPlatformPicker as InputSelect } from "tkk-rn-component-package";
import { docType } from "../../appData";
import { useRecoilState } from "recoil";
import { settingsState, AppSettings } from "../../state/recoilSettings";
import { checkUploadUrl } from "../../utils/uploadMultipart";

const STORAGE_KEY = "appSettings";
type metaDataType = {
  [fieldName: string]: string | number | boolean | null;
};
const SettingsRecoilScreen: React.FC = () => {
  const [settings, setSettings] = useRecoilState(settingsState);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isChanged, setIsChanged] = useState(false);
  const [metadata, setMetadata] = useState<metaDataType>({});
  const [urlStatus, setUrlStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingUrl, setIsTestingUrl] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsed = JSON.parse(json);
          setSettings(parsed);
          setLocalSettings(parsed);
        }
      } catch (e) {
        // ignore
      }
    };
    loadSettings();
  }, []);

  const handleChange = (field: keyof AppSettings, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
    setIsChanged(true);
  };

  const handleSave = async () => {
    setSettings(localSettings);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localSettings));
    setIsChanged(false);
  };

  const handleDocType =
    (field: string, value: string | boolean) => {
      setLocalSettings((prev) => ({ ...prev, docType: value as string }));
      setIsChanged(true);
    };
    
  const handleTestUrl = async () => {
    setIsTestingUrl(true);
    setUrlStatus(null);
    
    // Debug-Information
    console.log(`[Settings] Test URL: ${localSettings.uploadUrl}`);
    
    try {
      // Kurze Verzögerung für bessere UI/UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await checkUploadUrl(localSettings.uploadUrl);
      console.log("[Settings] URL-Test Ergebnis:", result);
      setUrlStatus(result);
    } catch (error) {
      console.error("[Settings] URL-Test Fehler:", error);
      setUrlStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten" 
      });
    } finally {
      setIsTestingUrl(false);
    }
  };
    
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings (Recoil + AsyncStorage)</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Upload URL</Text>
        <View style={styles.urlInputContainer}>
          <TextInput
            style={[styles.input, styles.urlInput]}
            value={localSettings.uploadUrl}
            onChangeText={(text) => {
              handleChange("uploadUrl", text);
              setUrlStatus(null); // Reset status on URL change
            }}
            placeholder="http://192.168.10.xxx:3000/upload"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
        </View>
        <Button
          title="Verbindung testen"
          onPress={handleTestUrl}
          disabled={!localSettings.uploadUrl || isTestingUrl}
          color="#007AFF"
        />
        {isTestingUrl && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}>Verbindung wird getestet...</Text>
          </View>
        )}
        {urlStatus && (
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                urlStatus.success ? styles.successText : styles.errorText
              ]}
            >
              {urlStatus.success ? '✅ ' : '❌ '}{urlStatus.message}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Belegart</Text>
        <InputSelect
          style={{ width: 400 }}
          label="Belegart"
          name="Belegart"
          placeholder="Belegart ..."
          theme={"dark"}
          enabled={true}
          validation={{ required: true }}
          onValueChange={handleDocType}
          items={docType.map((type) => ({ value: type }))}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Theme</Text>
        <View style={styles.themeRow}>
          <Button
            title="Light"
            color={localSettings.theme === "light" ? "#007AFF" : "#aaa"}
            onPress={() => handleChange("theme", "light")}
          />
          <Button
            title="Dark"
            color={localSettings.theme === "dark" ? "#007AFF" : "#aaa"}
            onPress={() => handleChange("theme", "dark")}
          />
    
        </View>
      </View>
      <Button
        title="Save"
        onPress={handleSave}
        disabled={!isChanged}
        color="#007AFF"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  urlInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  urlInput: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
  },
  successText: {
    color: "#28a745",
    fontWeight: "500",
  },
  errorText: {
    color: "#dc3545",
    fontWeight: "500",
  },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 16,
  },
});

export default SettingsRecoilScreen;
