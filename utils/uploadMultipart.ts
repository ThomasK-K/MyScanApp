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
    const url = uploadUrl || "http://localhost:3000/upload"; // Replace with your upload URL

    const response = await fetch(url, {
      body: formData,
      method: "POST",
    });

    // Prüfe zuerst, ob die Antwort JSON ist
    const contentType = response.headers.get("content-type");
    let responseData: any = null;

    if (contentType && contentType.includes("application/json")) {
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Response is not valid JSON:", e);
        return {
          success: false,
          message: "Server response is not valid JSON",
        };
      }
    } else {
      // Fallback: Text oder HTML anzeigen
      const text = await response.text();
      console.error("Server response is not JSON:", text);
      return {
        success: false,
        message: "Server response is not JSON",
        data: text,
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
    const url = uploadUrl || "http://localhost:3000/upload";
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
