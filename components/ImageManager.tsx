import React, { useState, useCallback, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { useRecoilState } from "recoil";
import {
  View,
  Image,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import {
  BigText,
  Modal as ErfassungsMaske,
  Input as MyInput,
  CrossPlatformPicker as InputSelect,
  Switch as MySwitch,
} from "tkk-rn-component-package";
import * as DocumentPicker from "expo-document-picker";
import DocumentScanner, {
  ResponseType,
} from "react-native-document-scanner-plugin";
import { UploadResponse,FileWithMetadata,metaDataType } from "../types";
import { InvoiceMetaDataForm } from "./MetaDataForms/InvoiceMetaDataForm";
import { ReceiptMetadataForm } from "./MetaDataForms/ReceiptMetadataForm";
import { settingsState, AppSettings } from "../state/recoilSettings";

import getFormattedDate from "../utils/getFormattedDate";

import {
  uploadImageWithMetadata,
  uploadImageWithMetadataWeb,
} from "../utils/uploadMultipart";


/////////////////////////////////////////////////////////////////////////////////
const FileMetadataManager: React.FC = () => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fieldData, setFieldData] = useState<metaDataType>({});
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<metaDataType>({});
  const [settings, setSettings] = useRecoilState(settingsState);

  useEffect(() => {
    const intializeMetaData = () => {
      setMetadata({
        doctype: settings.docType || "Steuerbeleg",
        year: "",
        name: "",
        category: "",
        subcategory: "",
        amount: "",
        switch: false,
      });
    };
    if (isModalVisible) {
      intializeMetaData();
    }
  }, [isModalVisible, settings.docType]);

  const scanDocument = useCallback(async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        //responseType: ResponseType.Base64,
      });
      // check if undefined
      if (scannedImages?.length) {
        // get back an array with scanned image file paths
        // Storage Path file:///data/user/0/com.anonymous.MyScanApp/cache/mlkit_docscan_ui_client

        const base64Data = scannedImages[0];
        const scannedImageFileName = `IMG_${getFormattedDate()}`;
        const path = `${
          FileSystem.cacheDirectory ?? "/tmp/"
        }${scannedImageFileName}.jpg`;

        const imageAsset: DocumentPicker.DocumentPickerAsset = {
          name: scannedImageFileName,
          uri: scannedImages[0],
          mimeType: "image/jpeg",
          size: 0,
        };
        await processFile(imageAsset, base64Data);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const pickFile = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets?.[0]) {
        //console.log("##### file", result.assets[0]);
        await processFile(result.assets[0], null);
      }
    } catch (error) {
      console.error("File selection error:", error);
      Alert.alert("Error", "Failed to select file");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processFile = useCallback(
    async (
      file: DocumentPicker.DocumentPickerAsset,
      base64Data: string | null
    ) => {
      try {
        const isImage = file.mimeType?.startsWith("image/");
        let processedBase64 = base64Data;
        if (Platform.OS === "web") {
          if (!file.file) {
            throw new Error("File object missing in web environment");
          }
          processedBase64 = file.uri;
        }
        ///
        else if (!processedBase64 && file.mimeType?.startsWith("image/")) {
          processedBase64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
        if (processedBase64) {
          const cleanBase64 = processedBase64.replace(
            /^data:image\/\w+;base64,/,
            ""
          );
          //console.log("##### mime", file.mimeType);
        }

        // setIsModalVisible(true);
        const newFile: FileWithMetadata = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType ?? null,
          // size: file.size || fileInfo.size || 0,
          size: 0,
          metadata: {},
        };

        setFiles((prev) => [...prev, newFile]);
      } catch (error) {
        console.error("File processing error:", error);
        Alert.alert("Error", "Failed to process file");
      }
    },
    []
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const openMetadataEditor = useCallback(
    (id: string) => {
      const file = files.find((file) => file.id === id);
      if (file) {
        setCurrentFileId(id);
        setMetadata(file.metadata || {});
        setIsModalVisible(true);
      }
    },
    [files]
  );

  const uploadFile = useCallback(
    async (id: string) => {
      const fileToUpload = files.find((file) => file.id === id);
      if (!fileToUpload) return;
      setIsLoading(true);
      // console.log("##### fileToUpload", metadata);
      try {
        let res: UploadResponse = { success: false };
        if (Platform.OS === "web") {
          res = await uploadImageWithMetadataWeb({
            ...fileToUpload,
            fieldData: fileToUpload.metadata,
          });
        } else {
          res = await uploadImageWithMetadata({
            ...fileToUpload,
            fieldData: fileToUpload.metadata,
          });
        }
        if (res.success) {
          Alert.alert("Success", res.message || "Upload successful");
          setMetadata(({}) => ({})); // Reset metadata after successful upload

          removeFile(id);
        } else {
          throw new Error(res.message || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        Alert.alert("Error", "Failed to upload file");
      } finally {
        setIsLoading(false);
      }
    },
    [files, removeFile]
  );

  const handleClose = (action: string): void => {
    // when Modal is closed
    if (action === "Save" && currentFileId) {
      console.log("##### metadata", metadata);
      setFiles((prev) =>
        prev.map((file) =>
          file.id === currentFileId ? { ...file, metadata } : file
        )
      );
    }
    setIsModalVisible(false);
    setCurrentFileId(null);
  };
  const onMetadataChange = useCallback(
    (field: string, value: string | boolean) => {
      setMetadata((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Example category data, replace with your actual data source if needed
  const catData: Array<{ [key: string]: any }> = [];

  //  store filed/value pair
  const onValueChange = (field: string, val: string) => {
    setFieldData({ ...fieldData, [field]: val });
    catData.map((item) => {
      const key = Object.keys(item)[0] as keyof typeof item;
      if (key === val) {
        // setcategory(item[key] ?? []);
      }
    });
  };

  const renderMetadataForm = () => {
    if (settings.docType === "Steuerbeleg") {
      return (
        <InvoiceMetaDataForm metadata={metadata} onChange={onMetadataChange} />
      );
    }
    if (settings.docType === "Rechnung") {
      return (
        <ReceiptMetadataForm metadata={metadata} onChange={onMetadataChange} />
      );
    }
    // Default
    return (
      <InvoiceMetaDataForm metadata={metadata} onChange={onMetadataChange} />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {isModalVisible && (
          <ErfassungsMaske
            buttonLabel="Speichern"
            visible={isModalVisible}
            onClose={handleClose}
            theme={"dark"}
          >
            <BigText style={{ color: "white" }}>
              {settings.docType} erfassen
            </BigText>
            <View style={styles.metadataContainer}>{renderMetadataForm()}</View>
          </ErfassungsMaske>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <View style={styles.viewActionButtons}>
            <TouchableOpacity
              style={styles.actionButtons}
              onPress={pickFile}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>Pick File </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtons}
              onPress={scanDocument}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>Scan File </Text>
            </TouchableOpacity>
          </View>
        )}

        {files.map((file) => (
          <View key={file.id} style={styles.fileCard}>
            <Image
              source={{ uri: file.uri }}
              style={styles.image}
              resizeMode="contain"
            />

            <View style={styles.metadata}>
              <Text style={styles.metadataText}>Name: {file.name}</Text>
              <Text style={styles.metadataText}>ID: {file.id}</Text>
              <Text style={styles.metadataText}>
                Type: {file.mimeType || "Unknown"}
              </Text>

              {file.metadata && Object.keys(file.metadata).map((key) => (
                <Text key={key} style={styles.metadataText}>
                  {key}: {String(metadata[key])}
                </Text>
              ))}
            </View>
            <View style={styles.viewActionButtons}>
              <TouchableOpacity
                style={styles.docButtons}
                onPress={() => removeFile(file.id)}
                disabled={isLoading}
              >
                <Text style={styles.docButtonText}>Delete </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.successButton]}
                onPress={() => openMetadataEditor(file.id)}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Edit Metadata</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.docButtons}
                onPress={() => uploadFile(file.id)}
                disabled={isLoading}
              >
                <Text style={styles.docButtonText}>Erfasse Doc </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  metadataContainer: {
    marginBottom: 20,
  },  
  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  successButton: {
    backgroundColor: "#34C759",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  loader: {
    marginVertical: 20,
  },
  fileCard: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
  metadata: {
    marginBottom: 10,
  },
  metadataText: {
    fontSize: 14,
    marginBottom: 4,
  },
  viewActionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButtons: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "white",
  },

  docButtons: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  docButtonText: {
    color: "white",
  },
});

export default FileMetadataManager;
