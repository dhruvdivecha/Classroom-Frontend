export interface CloudinaryUploadWidgetResultInfo {
  secure_url: string;
  public_id: string;
  delete_token?: string;
}

export interface CloudinaryUploadWidgetResult {
  event: "success";
  info: CloudinaryUploadWidgetResultInfo;
}

export interface CloudinaryWidget {
  open: () => void;
  close: () => void;
}

export interface CloudinaryCreateUploadWidgetOptions {
  cloudName: string;
  uploadPreset: string;
  multiple?: boolean;
  folder?: string;
  maxFileSize?: number;
  clientAllowedFormats?: string[];
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: CloudinaryCreateUploadWidgetOptions,
        callback: (error: unknown, result: CloudinaryUploadWidgetResult) => void
      ) => CloudinaryWidget;
    };
  }
}
