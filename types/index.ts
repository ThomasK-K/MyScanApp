export type documentType = "image/jpeg" | "image/png"  | undefined;


// export type FileWithMetadata = {
//     id: string;
//     uri: string;
//     name: string;
//     mimeType: string | null;
//     size: number;
//     fieldData?: {};
//   };
  
  // type metaDataType = {
  //   [fieldName: string]: string | number;
  // };
  export interface UploadResponse {
    success: boolean;
    message?: string;
    uri?: string;
    data?: any;
  }

  export type FileWithMetadata = {
  id: string;
  uri: string;
  name: string;
  mimeType: string | null;
  size: number;
  base64?: string;
  metadata?: metaDataType;
   fieldData?: {};
};
// Oder falls die Kategorien komplexer sind:
export interface Category {
  id: string;
}
export type CategoryType = string[];
export type metaDataType = {
  [fieldName: string]: string | number | boolean | null;
};