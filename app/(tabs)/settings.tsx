import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  Button,
  TextInput,
  Text,
} from "react-native";
import { ThemedText } from "../../components/Texts/ThemedText";
import { Input } from "tkk-rn-component-package";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettingsStore } from "../../hooks/useSettingsStore";
type AppSettings = {
  uploadUrl: string;
  theme: "dark" | "light";
};
type ValidationErrors = {
  apiUrl?: string;
  refreshInterval?: string;
};

const SettingsScreen: React.FC = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isChanged, setIsChanged] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>({
    uploadUrl: "",
    theme: "light",
  });
  const { settings, updateSettings } = useSettingsStore();
  console.log("Loaded settings:", settings);
  useEffect(() => {
    const setLocal = async () => {
      setLocalSettings(settings);
    };
    setLocal();
  }, []);

  const onMetadataChange = (value: string) => {
    console.log("onMetadataChange", value);
  };
  const handleSave = () => {
    console.log("handleSave", settings);
    saveSettings(localSettings);
    setIsChanged(false);
    // if (validate()) { }
  };

  // Einstellungen speichern
  const saveSettings = async (newSettings: AppSettings) => {
    try {
      updateSettings(newSettings);
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
    }
  };
  const handleChange = (field: keyof AppSettings, value: string) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
    setIsChanged(true);
  };
  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // API URL Validierung
    if (!settings.uploadUrl) {
      newErrors.apiUrl = "API URL ist erforderlich";
    } else if (!/^https?:\/\/.+\..+/.test(settings.uploadUrl)) {
      newErrors.apiUrl =
        "Ungültige URL (muss mit http:// oder https:// beginnen)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const dynamicStyles = getDynamicStyles(true);
  return (
    <ScrollView style={styles.mainContainer}>
      <ThemedText type="title">Settings</ThemedText>
      <View
        style={{
          width: 400,
          alignContent: "center",
          height: 200,
          alignSelf: "center",
          margin: 20,
          padding: 20,
          borderRadius: 10,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Input
          label="UploadUrl"
          name="uploadUrl"
          theme={"light"}
          onValueChange={onMetadataChange}
        />
        <Input
          label="Betrag"
          name="Betrag"
          theme={"light"}
          onValueChange={onMetadataChange}
        />

        <View style={dynamicStyles.inputGroup}>
          <Text style={dynamicStyles.label}>API URL:</Text>
          <TextInput
            style={[
              dynamicStyles.input,
              errors.apiUrl && dynamicStyles.inputError,
            ]}
            value={localSettings.uploadUrl}
            onChangeText={(text) => handleChange("uploadUrl", text)}
            placeholderTextColor={"#999"}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.apiUrl && (
            <Text style={dynamicStyles.errorText}>{errors.apiUrl}</Text>
          )}
        </View>
      </View>
      <Button
        title="Speichern"
        onPress={handleSave}
        disabled={!isChanged || Object.keys(errors).length > 0}
        color={"#007AFF"} // iOS-Standardfarbe
      />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 40,

    // gap: 8,
    flex: 1,
  },
  headerImage: {
    color: "#fff",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});

const lightTheme = {
  dark: false,
  colors: {
    primary: "#007AFF",
    background: "#FFFFFF",
    card: "#F5F5F5",
    text: "#1C1C1E",
    border: "#D1D1D6",
    notification: "#FF3B30",
  },
};

const darkTheme = {
  dark: true,
  colors: {
    primary: "#0A84FF",
    background: "#1C1C1E",
    card: "#2C2C2E",
    text: "#F5F5F5",
    border: "#3A3A3C",
    notification: "#FF453A",
  },
};

// Dynamische Styles basierend auf dem Theme
const getDynamicStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDarkMode
        ? darkTheme.colors.background
        : lightTheme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: isDarkMode ? darkTheme.colors.text : lightTheme.colors.text,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      color: isDarkMode ? darkTheme.colors.text : lightTheme.colors.text,
      marginBottom: 5,
      fontSize: 16,
    },
    input: {
      height: 50,
      borderColor: isDarkMode
        ? darkTheme.colors.border
        : lightTheme.colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      color: isDarkMode ? darkTheme.colors.text : lightTheme.colors.text,
      backgroundColor: isDarkMode
        ? darkTheme.colors.card
        : lightTheme.colors.card,
      fontSize: 16,
    },
    inputError: {
      borderColor: "#FF3B30",
      borderWidth: 1.5,
    },
    errorText: {
      color: "#FF3B30",
      fontSize: 14,
      marginTop: 5,
    },
    themeSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 10,
      paddingVertical: 8,
    },
    themeOptionText: {
      color: isDarkMode ? darkTheme.colors.text : lightTheme.colors.text,
      fontSize: 16,
    },
    infoCard: {
      backgroundColor: isDarkMode
        ? darkTheme.colors.card
        : lightTheme.colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDarkMode
        ? darkTheme.colors.border
        : lightTheme.colors.border,
    },
    infoText: {
      marginBottom: 12,
      color: isDarkMode ? darkTheme.colors.text : lightTheme.colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    infoLabel: {
      fontWeight: "bold",
    },
    text: {
      color: isDarkMode ? darkTheme.colors.text : lightTheme.colors.text,
      fontSize: 16,
    },
  });

export default SettingsScreen;
