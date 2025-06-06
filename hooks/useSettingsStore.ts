// lib/store/settingsStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom, useRecoilState, useSetRecoilState } from "recoil";
import { useEffect } from "react";

type Settings = {
  theme: "light" | "dark";
  uploadUrl: string;
};

type SettingsStore = {
  settings: Settings;
  loaded: boolean;
};

const defaultSettings: Settings = {
  theme: "light",
  uploadUrl: "http://localhost:3000/docs",
};

const settingsState = atom<SettingsStore>({
  key: "settingsState",
  default: {
    settings: defaultSettings,
    loaded: false,
  },
});

export const useSettingsStore = () => {
  const [store, setStore] = useRecoilState(settingsState);
  const setSettings = useSetRecoilState(settingsState);

  const loadSettings = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("@settings");
      //   console.log('Loaded settings:', jsonValue);
      if (jsonValue) {
        setStore({
          settings: JSON.parse(jsonValue),
          loaded: true,
        });
      } else {
        setStore((prev) => ({ ...prev, loaded: true }));
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...store.settings, ...newSettings };
    await AsyncStorage.setItem("@settings", JSON.stringify(updatedSettings));
    setSettings((prev) => ({
      ...prev,
      settings: updatedSettings,
    }));
  };

  // Automatisch Settings beim ersten Render laden
  useEffect(() => {
    if (!store.loaded) {
      loadSettings();
    }
  }, []);

  return {
    settings: store.settings,
    loaded: store.loaded,
    loadSettings,
    updateSettings,
  };
};
