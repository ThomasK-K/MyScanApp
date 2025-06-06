import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { IconSymbol } from "../../components/ui/IconSymbol";
import TabBarBackground from "../../components/ui/TabBarBackground";
import { Colors } from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const [settings, setSettings] = React.useState({
    apiUrl: "",
    refreshInterval: "30",
  });

  // Einstellungen beim Start laden
  useEffect(() => {
    const prepare = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem("appSettings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
          console.log("Settings", JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Fehler beim Laden der Einstellungen:", error);
      } finally {
        // Hier können Sie den Ladezustand zurücksetzen, wenn nötig
      }
    };

    prepare();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,

        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="document-scanner.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
