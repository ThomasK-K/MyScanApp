import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { FileWithMetadata } from "../types";

import { UploadResponse } from "../types";


// Datei auswählen
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri; // URI der ausgewählten Datei
  }
  return null;
};

export const uploadImageWithMetadataWeb = async (
  file: FileWithMetadata
): Promise<UploadResponse> => {
  try {
    // Remote URL
    const resp = await fetch(file.uri);
    if (!resp.ok) throw new Error(`Failed to fetch image (${resp.status})`);
    const blob = await resp.blob();

    const formData = new FormData();
    formData.append("image", blob, file.name);
    formData.append("fieldData", JSON.stringify(file.fieldData));

    // Upload with fetch
    const response = await fetch("http://localhost:3000/docs/upload", {
      method: "POST",
      body: formData,
    });
    const responseData = await response.json();

    if (!responseData.ok) {
      return {
        success: false,
        message: responseData.message || "Upload failed",
        data: responseData,
      };
    }
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }

  // Default return in case no other return is reached
  return {
    success: false,
    message: "Unexpected error occurred",
  };
};
export const uploadImageWithMetadata = async (
  file: FileWithMetadata
): Promise<UploadResponse> => {
  try {
    const response = await FileSystem.uploadAsync(
      "http://192.168.10.113:3000/docs/upload",
      file.uri,
      {
        headers: {
          // Auth etc
        },
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "image",
        mimeType: file.mimeType || "image/jpeg",
        parameters: {
          fieldData: file.fieldData ? JSON.stringify(file.fieldData) : "",
        },
      }
    );
    const result = JSON.parse(response.body);
console.log("Upload result:", result);
    return {
      success: result.success,
      message: result.message || "Upload successfull",
      uri: result.uri || file.uri,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
