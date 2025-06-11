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

// Default upload URLs
const DEFAULT_WEB_UPLOAD_URL = "http://localhost:3000/docs/upload";
const DEFAULT_NATIVE_UPLOAD_URL = "http://192.168.10.113:3000/docs/upload";

// Web upload function using Recoil settings
export const uploadImageWithMetadataWeb = async (
  file: FileWithMetadata,
  uploadUrl?: string
): Promise<UploadResponse> => {
  try {
    // Remote URL
    const resp = await fetch(file.uri);
    if (!resp.ok) throw new Error(`Failed to fetch image (${resp.status})`);
    const blob = await resp.blob();

    const formData = new FormData();
    formData.append("fieldData", JSON.stringify(file.fieldData));
    formData.append("image", blob, file.name);

    // Use uploadUrl from argument or fallback to default
    // const url = uploadUrl || DEFAULT_WEB_UPLOAD_URL;
    const url = 'http://localhost:3000/upload'; // Replace with your upload URL
    const response = await fetch(url, {
      body: formData,
      method: "POST",
    });
console.log("Response status:", response);
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error("Response is not valid JSON:", e);
      return {
        success: false,
        message: "Server response is not valid JSON",
      };
    }

    if (!responseData.ok) {
      return {
        success: false,
        message: responseData.message || "Upload failed",
        data: responseData,
      };
    }
    return {
      success: true,
      message: responseData.message || "Upload successful",
      data: responseData,
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
// Native upload function using Recoil settings
export const uploadImageWithMetadata = async (
  file: FileWithMetadata,
  uploadUrl?: string
): Promise<UploadResponse> => {
  try {
    // Use uploadUrl from argument or fallback to default
    const url = uploadUrl || DEFAULT_NATIVE_UPLOAD_URL;
    const response = await FileSystem.uploadAsync(url, file.uri, {
      headers: {
        // Auth etc
      },
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "image",
      mimeType: file.mimeType || "image/jpeg",
      parameters: {
        fieldData: file.fieldData ? JSON.stringify(file.fieldData) : "",
      },
    });
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
