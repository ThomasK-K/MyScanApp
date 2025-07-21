import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { FileWithMetadata } from "../types";
import { UploadResponse } from "../types";
import { Platform } from "react-native";

/**
 * Überprüft, ob eine Upload-URL erreichbar ist und richtig konfiguriert
 * @param url Die zu überprüfende URL
 * @returns Ein Promise mit einem Statusobjekt {success: boolean, message: string}
 */
export const checkUploadUrl = async (
  url: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!url || url.trim() === "") {
      return { success: false, message: "Keine URL angegeben" };
    }

    console.log(`[URL-Test] Teste URL: ${url} auf Plattform: ${Platform.OS}`);
    
    // URL-Behandlung je nach Plattform
    let testUrl = url;
    if (Platform.OS === 'web' && (url.includes('192.168.10.113:3000') || url.includes('192.168.10.123:3000'))) {
      // Extrahiere nur den Pfad nach dem Port für Web
      const urlObj = new URL(url);
      testUrl = urlObj.pathname; // z.B. /upload
      console.log("[URL-Test] Using relative URL for web:", testUrl);
    } else if (Platform.OS === 'android') {
      // Stelle sicher, dass die URL korrekt formatiert ist
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        testUrl = `http://${url}`;
        console.log("[URL-Test] URL-Format korrigiert für Android:", testUrl);
      }
    }
    
    // GET-Request anstelle von HEAD verwenden (funktioniert zuverlässiger)
    console.log(`[URL-Test] Sende Request an: ${testUrl}`);
    const response = await fetch(testUrl, { 
      method: 'GET',  // GET statt HEAD für bessere Kompatibilität
      headers: {
        'Accept': '*/*',  // Akzeptiere jeden Content-Type
      },
      cache: 'no-cache'  // Verhindert Caching
    });
    
    console.log(`[URL-Test] Antwort erhalten: Status ${response.status}`);
    
    if (response.ok) {
      return { 
        success: true, 
        message: `Verbindung erfolgreich (Status ${response.status})`
      };
    } else {
      return { 
        success: false, 
        message: `Server hat mit Status ${response.status} geantwortet`
      };
    }
  } catch (error) {
    console.error("URL-Test fehlgeschlagen:", error);
    
    // Detailliertere Fehlermeldung
    let errorMessage = "Unbekannter Fehler bei der Verbindungsprüfung";
    
    if (error instanceof Error) {
      console.log(`[URL-Test] Fehlerdetails: ${error.message}`);
      
      // Netzwerkfehler besser beschreiben
      if (error.message.includes('Network request failed')) {
        errorMessage = "Netzwerkfehler: Server nicht erreichbar";
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = "Verbindung abgelehnt: Server läuft nicht";
      } else if (error.message.includes('timed out')) {
        errorMessage = "Zeitüberschreitung: Server antwortet nicht";
      } else if (error.message.includes('certificate')) {
        errorMessage = "SSL/TLS-Zertifikatsfehler";
      } else {
        errorMessage = `Fehler: ${error.message}`;
      }
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

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
    console.log("[Upload] Uploading to:", url);
    
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
    
    console.log("[Upload] Response status:", response.status);
    console.log("[Upload] Raw response:", response.body.substring(0, 100) + "..."); // Zeige nur den Anfang
    
    // Überprüfe, ob die Antwort valides JSON ist
    try {
      const result = JSON.parse(response.body);
      console.log("[Upload] Parsed result:", result);
      return {
        success: result.success,
        message: result.message || "Upload erfolgreich",
        uri: result.uri || file.uri,
      };
    } catch (parseError) {
      console.error("[Upload] JSON Parse error:", parseError);
      
      // Prüfen, ob die Antwort HTML ist (beginnt mit "<")
      if (response.body.trim().startsWith("<")) {
        console.warn("[Upload] Server hat HTML statt JSON zurückgegeben");
        return {
          success: false,
          message: "Server hat keine gültige JSON-Antwort gesendet (HTML erhalten)",
          data: response.body.substring(0, 200) // Begrenzte Menge Text für Debugging
        };
      }
      
      return {
        success: false,
        message: "Konnte Server-Antwort nicht verarbeiten: " + 
                (parseError instanceof Error ? parseError.message : "Unbekannter Fehler"),
        data: response.body.substring(0, 100)
      };
    }
  } catch (error) {
    console.error("[Upload] Upload error:", error);
    
    let errorMessage = "Unbekannter Fehler beim Upload";
    
    if (error instanceof Error) {
      // Netzwerkfehler besser beschreiben
      if (error.message.includes('Network request failed')) {
        errorMessage = "Netzwerkfehler: Server nicht erreichbar";
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = "Verbindung abgelehnt: Server läuft nicht";
      } else if (error.message.includes('timed out')) {
        errorMessage = "Zeitüberschreitung: Server antwortet nicht";
      } else if (error.message.includes('JSON')) {
        errorMessage = "Fehler beim Verarbeiten der Antwort: " + error.message;
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};
