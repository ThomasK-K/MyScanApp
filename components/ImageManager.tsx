import React, { useState, useCallback, useMemo } from "react";
import * as FileSystem from "expo-file-system";
import { UploadResponse } from "../types";
import {
  BigText,
  Modal as ErfassungsMaske,
  Input as MyInput,
  CrossPlatformPicker as InputSelect,
  Switch as MySwitch,
} from "tkk-rn-component-package";
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
import * as DocumentPicker from "expo-document-picker";
import DocumentScanner, {
  ResponseType,
} from "react-native-document-scanner-plugin";
import getFormattedDate from "../utils/getFormattedDate";
import { catData, yearData, personData } from "../appData";
import {
  uploadImageWithMetadata,
  uploadImageWithMetadataWeb,
} from "../utils/uploadMultipart";

type FileWithMetadata = {
  id: string;
  uri: string;
  name: string;
  mimeType: string | null;
  size: number;
  base64?: string;
  metadata?: metaDataType;
};
// Oder falls die Kategorien komplexer sind:
interface Category {
  id: string;
}
type CategoryType = string[];
type metaDataType = {
  [fieldName: string]: string | number| boolean | null;
};
/////////////////////////////////////////////////////////////////////////////////
const FileMetadataManager: React.FC = () => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fieldData, setFieldData] = useState<metaDataType>({});
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<metaDataType>({});

  // // Get current file being edited
  // const currentFile = useMemo(() => {
  //   return files.find((file) => file.id === currentFileId);
  // }, [files, currentFileId]);

  // Get Sub categories based on selected category
  const categories: CategoryType = useMemo(() => {
    if (!metadata.Kategorie) return [];
    const subCategoryObj = catData.find(
      (item) => Object.keys(item)[0] === metadata.Kategorie
    );
    // console.log("##### categoryObj", subCategoryObj);
    return subCategoryObj
      ? subCategoryObj[metadata.Kategorie as keyof typeof subCategoryObj] || []
      : [];
  }, [metadata.Kategorie]);

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
      setFiles((prev) =>
        prev.map((file) =>
          file.id === currentFileId ? { ...file, metadata } : file
        )
      );
    }
    setIsModalVisible(false);
    setCurrentFileId(null);
  };
  const onMetadataChange = useCallback((field: string, value: string|boolean) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  }, []);


  const validateMetadata = useCallback(() => {
    return (
      metadata.Jahr &&
      metadata.Name &&
      metadata.Kategorie &&
      metadata.subKategorie &&
      metadata.betrag &&
      metadata.switch !== undefined
    );
  }, [metadata]);

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
            <BigText style={{color:'white'}}>Dokument erfassen</BigText>

            <InputSelect
              style={{ width: 400 }}
              label="Jahr"
              name="Jahr"
              placeholder="Jahr ..."
              theme={"dark"}
              enabled={true}
              validation={{ required: true }}
              onValueChange={onMetadataChange}
              items={yearData}
            />
            <InputSelect
              style={{ width: 400 }}
              label="Name"
              name="Name"
              placeholder="Beleg für ..."
              theme={"dark"}
              enabled={true}
              validation={{ required: true }}
              onValueChange={onMetadataChange}
              items={personData}
            />
            <InputSelect
              style={{ width: 400 }}
              label="Kategorie"
              name="Kategorie"
              placeholder="Kategorie ..."
              theme={"dark"}
              enabled={true}
              validation={{ required: true }}
              onValueChange={onMetadataChange}
              items={catData.map((item) => {
                const key = Object.keys(item)[0] as keyof typeof item;
                return { value: key };
              })}
            />
            {/* // Subcategories */}
            {categories.length > 0 ? (
              <InputSelect
                style={{ width: 400 }}
                label="subKategorie"
                name="subKategorie"
                placeholder="Sub Kategorie ..."
                theme={"dark"}
                enabled={true}
                validation={{ required: true }}
                onValueChange={onMetadataChange}
                items={categories.map((item) => ({ value: item }))}
              />
            ) : (
              <></>
            )}
           <MyInput
            label="Betrag"
            name="betrag"
            onValueChange={onMetadataChange}
            isDecimal={true}
            isPassword={false}
            validation={{ type: 'decimal', required: true }}
            theme={'dark'}
            props={{ style: { width: 200,height:50,padding:5} }}
          />
               <MySwitch 
            label="Nebenkosten?"
            name="switch"
            onValueChange={onMetadataChange}
          />
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
            {true && (
              <Image
                source={{ uri: file.uri }}
                style={styles.image}
                resizeMode="contain"
              />
            )}

            <View style={styles.metadata}>
              <Text style={styles.metadataText}>Name: {file.name}</Text>
              <Text style={styles.metadataText}>ID: {file.id}</Text>
              <Text style={styles.metadataText}>
                Type: {file.mimeType || "Unknown"}
              </Text>

              {Object.keys(metadata).map((key) => (
                <Text key={key} style={styles.metadataText}>
                  {key}: {metadata[key]}
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
