export type documentType = "image/jpeg" | "image/png"  | undefined;


export type FileWithMetadata = {
    id: string;
    uri: string;
    name: string;
    mimeType: string | null;
    size: number;
    fieldData?: {};
  };
  
  type metaDataType = {
    [fieldName: string]: string | number;
  };
  export interface UploadResponse {
    success: boolean;
    message?: string;
    uri?: string;
    data?: any;
  }